// 데모 모드 저장소: 시설은 정적 시드, 사용자 데이터는 로컬 JSON 파일(.demo-store.json).
// Vercel 등 읽기전용 환경에서는 파일 쓰기 실패 시 메모리에만 유지된다(데모 용도로 충분).
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  Feedback,
  Pet,
  Place,
  RoutePlan,
  TagWeights,
  Visit,
} from "@/types/domain";
import { DEMO_PLACES } from "@/data/demo/places";
import { updateTagWeights } from "@/lib/recommend/learning";
import type { PetInput, Repo, VisitInput } from "./types";

interface StoreShape {
  pets: Pet[];
  routes: RoutePlan[];
  visits: Visit[];
  /** key: `${userId}:${petId}` */
  tagPrefs: Record<string, TagWeights>;
}

const STORE_PATH = path.join(process.cwd(), ".demo-store.json");

function findPlace(id: string): Place | undefined {
  return DEMO_PLACES.find((p) => p.id === id);
}

/** 데모 계정의 초기 데이터 (펫 2 + 방문/피드백 10건) */
function initialStore(demoUserId: string): StoreShape {
  const now = Date.now();
  const iso = (daysAgo: number) =>
    new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  const kong: Pet = {
    id: "demo-pet-kong",
    userId: demoUserId,
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
    userId: demoUserId,
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
    [bori.id, "demo-001", 5, 40], // 문경새재 산책로
    [bori.id, "demo-006", 5, 40], // 진남교반 물놀이
    [bori.id, "demo-012", 4, 33], // 용추계곡
    [bori.id, "demo-018", 4, 26], // 영강 수변공원
    [bori.id, "demo-008", 2, 26], // 오미자터미널(실내·소형견전용) → 불만족
    [kong.id, "demo-008", 4, 21], // 오미자테마터널
    [kong.id, "demo-003", 3, 21], // 옛길박물관 앞뜰
    [kong.id, "demo-013", 5, 14], // 김룡사 숲길 (조용)
    [kong.id, "demo-005", 4, 7], // 고모산성 (한적)
    [kong.id, "demo-002", 2, 7], // 오픈세트장 (붐빔) → 불만족
  ];

  const visits: Visit[] = [];
  const tagPrefs: Record<string, TagWeights> = {};
  history.forEach(([petId, placeId, rating, daysAgo], i) => {
    const place = findPlace(placeId);
    if (!place) return;
    visits.push({
      id: `demo-visit-${i + 1}`,
      userId: demoUserId,
      petId,
      placeId,
      routeId: null,
      visitedAt: iso(daysAgo),
      feedback: { rating, comment: null, createdAt: iso(daysAgo) },
    });
    const key = `${demoUserId}:${petId}`;
    tagPrefs[key] = updateTagWeights(tagPrefs[key] ?? {}, place.tags, rating);
  });

  return { pets: [kong, bori], routes: [], visits, tagPrefs };
}

let memoryStore: StoreShape | null = null;

function loadStore(demoUserId: string): StoreShape {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(STORE_PATH)) {
      memoryStore = JSON.parse(
        fs.readFileSync(STORE_PATH, "utf-8"),
      ) as StoreShape;
      return memoryStore;
    }
  } catch {
    // 손상된 파일 → 초기화
  }
  memoryStore = initialStore(demoUserId);
  saveStore();
  return memoryStore;
}

function saveStore(): void {
  if (!memoryStore) return;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch {
    // 읽기전용 파일시스템(Vercel 등) → 메모리로만 유지
  }
}

export function createDemoRepo(demoUserId: string): Repo {
  const store = () => loadStore(demoUserId);

  return {
    async listPlaces() {
      return DEMO_PLACES;
    },
    async getPlace(id) {
      return findPlace(id) ?? null;
    },
    async listVets() {
      return DEMO_PLACES.filter((p) => p.category === "VET");
    },

    async listPets(userId) {
      return store().pets.filter((p) => p.userId === userId);
    },
    async getPet(userId, id) {
      return (
        store().pets.find((p) => p.id === id && p.userId === userId) ?? null
      );
    },
    async createPet(userId, input) {
      const pet: Pet = {
        id: randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        ...input,
      };
      store().pets.push(pet);
      saveStore();
      return pet;
    },
    async updatePet(userId, id, input) {
      const pet = store().pets.find(
        (p) => p.id === id && p.userId === userId,
      );
      if (!pet) return null;
      Object.assign(pet, input);
      saveStore();
      return pet;
    },
    async deletePet(userId, id) {
      const s = store();
      const before = s.pets.length;
      s.pets = s.pets.filter((p) => !(p.id === id && p.userId === userId));
      s.routes = s.routes.filter((r) => r.petId !== id);
      s.visits = s.visits.filter((v) => v.petId !== id);
      saveStore();
      return s.pets.length < before;
    },

    async createRoute(route) {
      const created: RoutePlan = {
        ...route,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };
      store().routes.push(created);
      saveStore();
      return created;
    },
    async getRoute(id) {
      return store().routes.find((r) => r.id === id) ?? null;
    },
    async listRoutes(userId) {
      return store()
        .routes.filter((r) => r.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async createVisit(userId, input: VisitInput) {
      const visit: Visit = {
        id: randomUUID(),
        userId,
        petId: input.petId,
        placeId: input.placeId,
        routeId: input.routeId ?? null,
        visitedAt: input.visitedAt ?? new Date().toISOString(),
        feedback: null,
      };
      store().visits.push(visit);
      saveStore();
      return visit;
    },
    async listVisits(userId) {
      return store()
        .visits.filter((v) => v.userId === userId)
        .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
    },
    async setFeedback(userId, visitId, feedback: Omit<Feedback, "createdAt">) {
      const s = store();
      const visit = s.visits.find(
        (v) => v.id === visitId && v.userId === userId,
      );
      if (!visit) return null;
      visit.feedback = { ...feedback, createdAt: new Date().toISOString() };

      // 학습 루프: 피드백 즉시 태그 가중치 갱신
      const place = findPlace(visit.placeId);
      if (place) {
        const key = `${userId}:${visit.petId}`;
        s.tagPrefs[key] = updateTagWeights(
          s.tagPrefs[key] ?? {},
          place.tags,
          feedback.rating,
        );
      }
      saveStore();
      return visit;
    },

    async getTagWeights(userId, petId) {
      return store().tagPrefs[`${userId}:${petId}`] ?? {};
    },
    async setTagWeights(userId, petId, weights) {
      store().tagPrefs[`${userId}:${petId}`] = weights;
      saveStore();
    },
  };
}
