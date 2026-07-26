// 시간 예산 안에서 코스를 구성하는 탐욕적 경로 빌더.
// 규칙:
//  - 같은 카테고리 연속 배치 금지, 카페는 최대 2곳
//  - 점심 시간대(12:00~13:30)에 도착하는 슬롯에는 식당 우선
//  - 다음 스팟 선택 = 점수 − 이동시간 패널티(argmax)
import type { Pet, Place, RouteStop, TagWeights, Theme } from "@/types/domain";
import { estimateTravelMinutes, haversineKm } from "@/lib/geo";
import { rankPlaces, type ScoredPlace } from "./scoring";

export interface BuildRouteParams {
  pet: Pet;
  places: Place[];
  theme: Theme;
  /** 총 가용 시간(분) */
  totalMinutes: number;
  /** HH:mm — 기본 10:00 */
  startTime?: string;
  learned?: TagWeights;
  /** 스팟 수 상한 (기본 5) */
  maxStops?: number;
}

export interface BuiltRoute {
  stops: RouteStop[];
  usedMinutes: number;
  title: string;
}

const TRAVEL_PENALTY_PER_MIN = 0.008; // 이동 1분당 점수 차감
const LUNCH_START = 12 * 60;
const LUNCH_END = 13 * 60 + 30;

function parseStart(hhmm: string | undefined): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? "");
  if (!m) return 10 * 60;
  return Number(m[1]) * 60 + Number(m[2]);
}

function isLunchWindow(startOfDayMin: number, offsetMin: number): boolean {
  const t = startOfDayMin + offsetMin;
  return t >= LUNCH_START && t <= LUNCH_END;
}

export function buildRoute(params: BuildRouteParams): BuiltRoute {
  const {
    pet,
    places,
    theme,
    totalMinutes,
    startTime,
    learned = {},
    maxStops = 5,
  } = params;

  const ranked = rankPlaces(pet, places, theme, learned).filter(
    (s) => s.place.category !== "STAY", // 당일 코스에는 숙박 제외
  );
  const stops: RouteStop[] = [];
  if (ranked.length === 0) return { stops, usedMinutes: 0, title: "코스 없음" };

  const startOfDay = parseStart(startTime);
  const remaining = new Map(ranked.map((s) => [s.place.id, s]));
  let cafeCount = 0;
  let offset = 0; // 경과 시간(분)

  // 첫 스팟: 최고 점수 (단, 첫 스팟이 식사면 점심시간과 안 맞을 수 있어 카페/식당 제외 우선)
  const firstPick =
    ranked.find(
      (s) => s.place.category !== "RESTAURANT" && s.place.category !== "CAFE",
    ) ?? ranked[0];

  const push = (s: ScoredPlace, travelMinutes: number) => {
    stops.push({
      order: stops.length + 1,
      placeId: s.place.id,
      place: s.place,
      arriveOffsetMin: offset + travelMinutes,
      stayMinutes: s.place.avgStayMinutes,
      travelMinutes,
    });
    offset += travelMinutes + s.place.avgStayMinutes;
    remaining.delete(s.place.id);
    if (s.place.category === "CAFE") cafeCount += 1;
  };

  if (firstPick.place.avgStayMinutes <= totalMinutes) {
    push(firstPick, 0);
  } else {
    return { stops, usedMinutes: 0, title: "시간이 부족해요" };
  }

  while (stops.length < maxStops) {
    const last = stops[stops.length - 1];
    const lunchSlot = isLunchWindow(startOfDay, offset);

    let best: { s: ScoredPlace; travel: number; value: number } | null = null;
    for (const s of remaining.values()) {
      const cat = s.place.category;
      if (cat === last.place.category) continue; // 연속 동일 카테고리 금지
      if (cat === "CAFE" && cafeCount >= 2) continue;

      const km = haversineKm(
        last.place.lat,
        last.place.lng,
        s.place.lat,
        s.place.lng,
      );
      const travel = estimateTravelMinutes(km);
      if (offset + travel + s.place.avgStayMinutes > totalMinutes) continue;

      let value = s.score - travel * TRAVEL_PENALTY_PER_MIN;
      // 점심 시간대 도착이면 식당에 큰 가점, 아니면 식당 약간 감점
      if (lunchSlot && cat === "RESTAURANT") value += 0.5;
      if (!lunchSlot && cat === "RESTAURANT") value -= 0.15;

      if (!best || value > best.value) best = { s, travel, value };
    }
    if (!best) break;
    push(best.s, best.travel);
  }

  const title = makeTitle(theme, stops);
  return { stops, usedMinutes: offset, title };
}

function makeTitle(theme: Theme, stops: RouteStop[]): string {
  const themeWord: Record<Theme, string> = {
    NATURE_HEALING: "힐링",
    CAFE_FOOD: "미식",
    HISTORY_CULTURE: "시간여행",
    ACTIVITY: "신나는",
  };
  const anchor = stops[0]?.place.name ?? "문경";
  return `${anchor}에서 시작하는 ${themeWord[theme]} 코스`;
}
