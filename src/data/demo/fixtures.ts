// 데모 계정 초기 데이터 (펫 2 + 방문/피드백 10건).
// 로컬 파일 저장소와 Firestore 시드 스크립트가 공용으로 사용한다.
import type { Pet, TagWeights, Visit } from "@/types/domain";
import { updateTagWeights } from "@/lib/recommend/learning";
import { DEMO_PLACES } from "./places";

export interface DemoData {
  pets: Pet[];
  visits: Visit[];
  /** key: petId */
  tagPrefs: Record<string, TagWeights>;
}

export function buildDemoData(userId: string): DemoData {
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

  // (petId, placeId, rating, daysAgo)
  const history: Array<[string, string, number, number]> = [
    [bori.id, "demo-001", 5, 40],
    [bori.id, "demo-006", 5, 40],
    [bori.id, "demo-012", 4, 33],
    [bori.id, "demo-018", 4, 26],
    [bori.id, "demo-008", 2, 26],
    [kong.id, "demo-008", 4, 21],
    [kong.id, "demo-003", 3, 21],
    [kong.id, "demo-013", 5, 14],
    [kong.id, "demo-005", 4, 7],
    [kong.id, "demo-002", 2, 7],
  ];

  const visits: Visit[] = [];
  const tagPrefs: Record<string, TagWeights> = {};
  history.forEach(([petId, placeId, rating, daysAgo], i) => {
    const place = DEMO_PLACES.find((p) => p.id === placeId);
    if (!place) return;
    visits.push({
      id: `demo-visit-${i + 1}`,
      userId,
      petId,
      placeId,
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
