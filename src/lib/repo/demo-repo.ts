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
import REAL_PLACES_JSON from "@/data/real/places.json";
import { buildDemoData } from "@/data/demo/fixtures";
import { updateTagWeights } from "@/lib/recommend/learning";
import type { Repo, VisitInput } from "./types";

// TourAPI 스냅샷(scripts/export-places.ts 산출물)이 있으면 실데이터를,
// 없으면 내장 데모 시드를 사용한다. Firebase 없는 배포(Vercel 데모 모드)에서도
// 실데이터로 동작하게 하기 위함.
const REAL_PLACES = REAL_PLACES_JSON as unknown as Place[];
const PLACES: Place[] = REAL_PLACES.length > 0 ? REAL_PLACES : DEMO_PLACES;

interface StoreShape {
  pets: Pet[];
  routes: RoutePlan[];
  visits: Visit[];
  /** key: `${userId}:${petId}` */
  tagPrefs: Record<string, TagWeights>;
}

const STORE_PATH = path.join(process.cwd(), ".demo-store.json");

function findPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

/** 데모 계정의 초기 데이터 (src/data/demo/fixtures.ts 공용 픽스처) */
function initialStore(demoUserId: string): StoreShape {
  const demo = buildDemoData(demoUserId, PLACES);
  const tagPrefs: Record<string, TagWeights> = {};
  for (const [petId, weights] of Object.entries(demo.tagPrefs)) {
    tagPrefs[`${demoUserId}:${petId}`] = weights;
  }
  return { pets: demo.pets, routes: [], visits: demo.visits, tagPrefs };
}

let memoryStore: StoreShape | null = null;
let loadedMtimeMs = 0;

// Next dev/서버리스는 워커 프로세스가 여러 개일 수 있어, 파일 mtime이 바뀌면
// 메모리 캐시를 무효화해 워커 간 쓰기가 서로 보이게 한다.
function loadStore(demoUserId: string): StoreShape {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const mtimeMs = fs.statSync(STORE_PATH).mtimeMs;
      if (!memoryStore || mtimeMs > loadedMtimeMs) {
        memoryStore = JSON.parse(
          fs.readFileSync(STORE_PATH, "utf-8"),
        ) as StoreShape;
        loadedMtimeMs = mtimeMs;
      }
      return memoryStore;
    }
  } catch {
    // 손상된 파일 → 아래에서 초기화
  }
  if (memoryStore) return memoryStore; // 파일 쓰기 불가 환경 → 메모리 유지
  memoryStore = initialStore(demoUserId);
  saveStore();
  return memoryStore;
}

function saveStore(): void {
  if (!memoryStore) return;
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(memoryStore, null, 2), "utf-8");
    loadedMtimeMs = fs.statSync(STORE_PATH).mtimeMs;
  } catch {
    // 읽기전용 파일시스템(Vercel 등) → 메모리로만 유지
  }
}

export function createDemoRepo(demoUserId: string): Repo {
  const store = () => loadStore(demoUserId);

  return {
    async listPlaces() {
      return PLACES;
    },
    async getPlace(id) {
      return findPlace(id) ?? null;
    },
    async listVets() {
      return PLACES.filter((p) => p.category === "VET");
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
