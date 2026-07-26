// 추천 점수 계산 코어.
// score = 0.40×tagAffinity + 0.25×themeMatch + 0.20×feedbackBoost + 0.15×popularity
// 하드 제약(대형견 불가 등) 위반 시 후보에서 제외한다.
import type { Pet, Place, TagWeights, Theme } from "@/types/domain";

export const WEIGHTS = {
  tagAffinity: 0.4,
  themeMatch: 0.25,
  feedback: 0.2,
  popularity: 0.15,
} as const;

/** 하드 제약: false면 이 장소는 추천 후보에서 탈락 */
export function passesHardConstraints(pet: Pet, place: Place): boolean {
  if (place.category === "VET") return false; // 병원은 코스가 아닌 오버레이로
  if (pet.sizeClass === "LARGE" && !place.allowLarge) return false;
  if (
    pet.sizeClass !== "SMALL" &&
    place.tags.includes("소형견전용")
  ) {
    return false;
  }
  return true;
}

/** 펫 성향 → 선호/기피 태그 가중치 맵 (합산 후 0~1로 정규화) */
export function petTagPreferences(pet: Pet): TagWeights {
  const w: TagWeights = {};
  const add = (tag: string, v: number) => {
    w[tag] = (w[tag] ?? 0) + v;
  };

  // 활동량: 1(저) ~ 5(고)
  const energy = (pet.energyLevel - 3) / 2; // -1 ~ +1
  add("산책", 0.5 + 0.5 * energy);
  add("숲길", 0.4 + 0.5 * energy);
  add("오프리쉬", 0.3 + 0.7 * energy);
  add("액티비티", 0.2 + 0.6 * energy);
  add("계곡", 0.3 + 0.4 * energy);
  add("물놀이", 0.2 + 0.4 * energy);
  add("잔디마당", 0.4 + 0.3 * energy);

  // 사회성: 낮으면 조용한 곳 선호, 북적이는 곳 기피
  const social = (pet.sociability - 3) / 2;
  add("조용한", 0.5 - 0.5 * social);
  add("북적이는", 0.2 + 0.6 * social);

  // 실내 선호
  if (pet.prefersIndoor) {
    add("실내", 0.8);
    add("테라스", 0.3);
    add("야외", -0.2);
  } else {
    add("야외", 0.5);
    add("테라스", 0.4);
  }

  // 소형견은 실내/카페 접근성이 좋고, 대형견은 넓은 야외가 좋다
  if (pet.sizeClass === "SMALL") {
    add("커피", 0.3);
    add("간식", 0.2);
  }
  if (pet.sizeClass === "LARGE") {
    add("대형견환영", 0.8);
    add("잔디마당", 0.3);
  }

  return w;
}

/** 펫 성향과 장소 태그의 적합도. 0~1 */
export function tagAffinity(pet: Pet, place: Place): number {
  if (place.tags.length === 0) return 0.4; // 정보 없음 → 중립보다 약간 낮게
  const prefs = petTagPreferences(pet);
  let sum = 0;
  let matched = 0;
  for (const tag of place.tags) {
    const v = prefs[tag];
    if (v !== undefined) {
      sum += v;
      matched += 1;
    }
  }
  if (matched === 0) return 0.45;
  // 매칭 태그 평균을 0~1로 클램프
  return Math.min(1, Math.max(0, sum / matched));
}

/** 테마 → (카테고리 가점, 태그 가점) */
const THEME_RULES: Record<
  Theme,
  { categories: Record<string, number>; tags: Record<string, number> }
> = {
  NATURE_HEALING: {
    categories: { NATURE: 1, TRAIL: 1, CAFE: 0.4, STAY: 0.3 },
    tags: { 숲길: 0.3, 계곡: 0.3, 산책: 0.3, 조용한: 0.3, 전망: 0.2 },
  },
  CAFE_FOOD: {
    categories: { CAFE: 1, RESTAURANT: 1, NATURE: 0.3, TRAIL: 0.3 },
    tags: { 커피: 0.3, 간식: 0.3, 식사: 0.3, 테라스: 0.2 },
  },
  HISTORY_CULTURE: {
    categories: { CULTURE: 1, TRAIL: 0.6, CAFE: 0.3 },
    tags: { 역사: 0.4, 포토스팟: 0.2, 체험: 0.2 },
  },
  ACTIVITY: {
    categories: { ACTIVITY: 1, NATURE: 0.5, TRAIL: 0.4 },
    tags: { 액티비티: 0.4, 오프리쉬: 0.3, 물놀이: 0.2, 체험: 0.2 },
  },
};

/** 선택 테마와 장소의 매칭도. 0~1 */
export function themeMatch(theme: Theme, place: Place): number {
  const rule = THEME_RULES[theme];
  const catScore = rule.categories[place.category] ?? 0.1;
  let tagScore = 0;
  for (const tag of place.tags) {
    tagScore += rule.tags[tag] ?? 0;
  }
  return Math.min(1, catScore * 0.6 + Math.min(1, tagScore) * 0.4);
}

/** 학습된 태그 가중치(-1~+1) 기반 보정. 0~1 (0.5가 중립) */
export function feedbackBoost(weights: TagWeights, place: Place): number {
  if (place.tags.length === 0) return 0.5;
  let sum = 0;
  let n = 0;
  for (const tag of place.tags) {
    const v = weights[tag];
    if (v !== undefined) {
      sum += v;
      n += 1;
    }
  }
  if (n === 0) return 0.5;
  return Math.min(1, Math.max(0, 0.5 + (sum / n) * 0.5));
}

export interface ScoredPlace {
  place: Place;
  score: number;
  parts: {
    tagAffinity: number;
    themeMatch: number;
    feedback: number;
    popularity: number;
  };
}

export function scorePlace(
  pet: Pet,
  place: Place,
  theme: Theme,
  learned: TagWeights,
): ScoredPlace {
  const parts = {
    tagAffinity: tagAffinity(pet, place),
    themeMatch: themeMatch(theme, place),
    feedback: feedbackBoost(learned, place),
    popularity: Math.min(1, Math.max(0, place.popularity)),
  };
  const score =
    parts.tagAffinity * WEIGHTS.tagAffinity +
    parts.themeMatch * WEIGHTS.themeMatch +
    parts.feedback * WEIGHTS.feedback +
    parts.popularity * WEIGHTS.popularity;
  return { place, score, parts };
}

/** 후보 필터 + 점수화 + 내림차순 정렬 */
export function rankPlaces(
  pet: Pet,
  places: Place[],
  theme: Theme,
  learned: TagWeights,
): ScoredPlace[] {
  return places
    .filter((p) => passesHardConstraints(pet, p))
    .map((p) => scorePlace(pet, p, theme, learned))
    .sort((a, b) => b.score - a.score);
}
