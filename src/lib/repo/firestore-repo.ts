// Firestore(firebase-admin) 기반 저장소.
// 컬렉션 구조:
//   places/{placeId}                     — 시설 (최초 접근 시 시드 자동 적재)
//   users/{uid}/pets/{petId}             — 반려동물 프로필
//   users/{uid}/routes/{routeId}         — 생성된 코스 (스팟에 place 스냅샷 포함)
//   users/{uid}/visits/{visitId}         — 방문 기록 (feedback 내장)
//   users/{uid}/tagPrefs/{petId}         — 학습된 태그 가중치
import { randomUUID } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import type {
  Pet,
  Place,
  RoutePlan,
  TagWeights,
  Visit,
} from "@/types/domain";
import { DEMO_PLACES } from "@/data/demo/places";
import { updateTagWeights } from "@/lib/recommend/learning";
import { adminDb } from "@/lib/firebase/admin";
import type { Repo, VisitInput } from "./types";

let placesSeeded = false;

async function ensurePlacesSeeded(db: Firestore): Promise<void> {
  if (placesSeeded) return;
  const probe = await db.collection("places").limit(1).get();
  if (probe.empty) {
    const batchLimit = 400;
    for (let i = 0; i < DEMO_PLACES.length; i += batchLimit) {
      const batch = db.batch();
      for (const place of DEMO_PLACES.slice(i, i + batchLimit)) {
        batch.set(db.collection("places").doc(place.id), place);
      }
      await batch.commit();
    }
  }
  placesSeeded = true;
}

function userCol(db: Firestore, userId: string, name: string) {
  return db.collection("users").doc(userId).collection(name);
}

export function createFirestoreRepo(): Repo {
  const db = adminDb();

  return {
    async listPlaces() {
      await ensurePlacesSeeded(db);
      const snap = await db.collection("places").get();
      return snap.docs.map((d) => d.data() as Place);
    },
    async getPlace(id) {
      await ensurePlacesSeeded(db);
      const doc = await db.collection("places").doc(id).get();
      return doc.exists ? (doc.data() as Place) : null;
    },
    async listVets() {
      await ensurePlacesSeeded(db);
      const snap = await db
        .collection("places")
        .where("category", "==", "VET")
        .get();
      return snap.docs.map((d) => d.data() as Place);
    },

    async listPets(userId) {
      const snap = await userCol(db, userId, "pets")
        .orderBy("createdAt")
        .get();
      return snap.docs.map((d) => d.data() as Pet);
    },
    async getPet(userId, id) {
      const doc = await userCol(db, userId, "pets").doc(id).get();
      return doc.exists ? (doc.data() as Pet) : null;
    },
    async createPet(userId, input) {
      const pet: Pet = {
        id: randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        ...input,
      };
      await userCol(db, userId, "pets").doc(pet.id).set(pet);
      return pet;
    },
    async updatePet(userId, id, input) {
      const ref = userCol(db, userId, "pets").doc(id);
      const doc = await ref.get();
      if (!doc.exists) return null;
      const pet = { ...(doc.data() as Pet), ...input };
      await ref.set(pet);
      return pet;
    },
    async deletePet(userId, id) {
      const ref = userCol(db, userId, "pets").doc(id);
      const doc = await ref.get();
      if (!doc.exists) return false;
      await ref.delete();
      // 연관 데이터 정리
      for (const col of ["routes", "visits"] as const) {
        const snap = await userCol(db, userId, col)
          .where("petId", "==", id)
          .get();
        const batch = db.batch();
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      await userCol(db, userId, "tagPrefs").doc(id).delete();
      return true;
    },

    async createRoute(route) {
      const created: RoutePlan = {
        ...route,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
      };
      await userCol(db, route.userId, "routes").doc(created.id).set(created);
      return created;
    },
    async getRoute(id) {
      // 코스 공유를 고려해 collectionGroup으로 조회
      const snap = await db
        .collectionGroup("routes")
        .where("id", "==", id)
        .limit(1)
        .get();
      return snap.empty ? null : (snap.docs[0].data() as RoutePlan);
    },
    async listRoutes(userId) {
      const snap = await userCol(db, userId, "routes")
        .orderBy("createdAt", "desc")
        .get();
      return snap.docs.map((d) => d.data() as RoutePlan);
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
      await userCol(db, userId, "visits").doc(visit.id).set(visit);
      return visit;
    },
    async listVisits(userId) {
      const snap = await userCol(db, userId, "visits")
        .orderBy("visitedAt", "desc")
        .get();
      return snap.docs.map((d) => d.data() as Visit);
    },
    async setFeedback(userId, visitId, feedback) {
      const ref = userCol(db, userId, "visits").doc(visitId);
      const doc = await ref.get();
      if (!doc.exists) return null;
      const visit = doc.data() as Visit;
      visit.feedback = { ...feedback, createdAt: new Date().toISOString() };
      await ref.set(visit);

      // 학습 루프: 태그 가중치 갱신
      const placeDoc = await db.collection("places").doc(visit.placeId).get();
      if (placeDoc.exists) {
        const place = placeDoc.data() as Place;
        const prefRef = userCol(db, userId, "tagPrefs").doc(visit.petId);
        const prefDoc = await prefRef.get();
        const weights = prefDoc.exists
          ? ((prefDoc.data() as { weights: TagWeights }).weights ?? {})
          : {};
        await prefRef.set({
          weights: updateTagWeights(weights, place.tags, feedback.rating),
        });
      }
      return visit;
    },

    async getTagWeights(userId, petId) {
      const doc = await userCol(db, userId, "tagPrefs").doc(petId).get();
      if (!doc.exists) return {};
      return (doc.data() as { weights: TagWeights }).weights ?? {};
    },
    async setTagWeights(userId, petId, weights) {
      await userCol(db, userId, "tagPrefs").doc(petId).set({ weights });
    },
  };
}
