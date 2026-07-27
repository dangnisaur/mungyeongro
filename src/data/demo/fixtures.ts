// 데모 계정 초기 데이터 (펫 2 + 방문/피드백 10건).
// 로컬 파일 저장소와 Firestore 시드 스크립트가 공용으로 사용한다.
import type { Pet, Place, TagWeights, Visit } from "@/types/domain";
import { updateTagWeights } from "@/lib/recommend/learning";
import { DEMO_PLACES } from "./places";

export interface DemoData {
  pets: Pet[];
  visits: Visit[];
  /** key: petId */
  tagPrefs: Record<string, TagWeights>;
}

/**
 * @param places 방문기록을 만들 시설 풀. 기본은 내장 데모 시드지만,
 *   실데이터(TourAPI) 시드 후에는 Firestore의 실제 시설을 넘겨 이름 키워드로 매칭한다.
 */
export function buildDemoData(
  userId: string,
  places: readonly Place[] = DEMO_PLACES,
): DemoData {
  const now = Date.now();
  const iso = (daysAgo: number) =>
    new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  const kong: Pet = {
    id: "demo-pet-kong",
    userId,
    name: "콩이",
    breed: "말티즈",
    sizeClass: "SMALL",
    weightKg: 3.2,
    ageYears: 6,
    energyLevel: 2,
    sociability: 2,
    prefersIndoor: true,
    notes: "낯가림이 있어요. 조용한 곳을 좋아해요.",
    createdAt: iso(60),
  };
  const bori: Pet = {
    id: "demo-pet-bori",
    userId,
    name: "보리",
    breed: "골든 리트리버",
    sizeClass: "LARGE",
    weightKg: 28,
    ageYears: 3,
    energyLevel: 5,
    sociability: 5,
    prefersIndoor: false,
    notes: "물을 아주 좋아해요!",
    createdAt: iso(55),
  };

  // (petId, 시설 이름 키워드, rating, daysAgo) — 데모/실데이터 어느 쪽에서도 매칭되게 키워드 사용
  const history: Array<[string, string, number, number]> = [
    [bori.id, "새재", 5, 40],
    [bori.id, "진남교반", 5, 40],
    [bori.id, "계곡", 4, 33],
    [bori.id, "공원", 4, 26],
    [bori.id, "철로자전거", 2, 26], // 중소형견만 가능 → 대형견 보리는 불만족
    [kong.id, "오미자", 4, 21],
    [kong.id, "박물관", 3, 21],
    [kong.id, "김룡사", 5, 14],
    [kong.id, "고모산성", 4, 7],
    [kong.id, "세트장", 2, 7],
  ];

  const visits: Visit[] = [];
  const tagPrefs: Record<string, TagWeights> = {};
  const used = new Set<string>();
  history.forEach(([petId, keyword, rating, daysAgo], i) => {
    const place = places.find(
      (p) =>
        p.category !== "VET" && p.name.includes(keyword) && !used.has(p.id),
    );
    if (!place) return;
    used.add(place.id);
    visits.push({
      id: `demo-visit-${i + 1}`,
      userId,
      petId,
      placeId: place.id,
      routeId: null,
      visitedAt: iso(daysAgo),
      feedback: { rating, comment: null, createdAt: iso(daysAgo) },
    });
    tagPrefs[petId] = updateTagWeights(
      tagPrefs[petId] ?? {},
      place.tags,
      rating,
    );
  });

  return { pets: [kong, bori], visits, tagPrefs };
}
