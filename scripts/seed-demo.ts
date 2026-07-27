// Firestore에 시설 시드 + 데모 계정(demo@mung.kr / demo1234)을 만든다.
// 실행: npm run seed:demo  (에뮬레이터가 떠 있어야 함: npm run emulators)
import "./load-env";

process.env.NEXT_PUBLIC_FIREBASE_EMULATOR ??= "1";

import { adminAuth, adminDb } from "../src/lib/firebase/admin";
import { DEMO_PLACES } from "../src/data/demo/places";
import { buildDemoData } from "../src/data/demo/fixtures";
import type { Place } from "../src/types/domain";

const DEMO_EMAIL = "demo@mung.kr";
const DEMO_PASSWORD = "demo1234";

async function main(): Promise<void> {
  const db = adminDb();
  const auth = adminAuth();

  // 1) 시설 시드 — 이미 실데이터(TOURAPI)가 있으면 데모 시설은 건드리지 않는다
  const tourSnap = await db
    .collection("places")
    .where("source", "==", "TOURAPI")
    .limit(1)
    .get();
  if (tourSnap.empty) {
    console.log(`시설 ${DEMO_PLACES.length}곳 적재 중...`);
    for (let i = 0; i < DEMO_PLACES.length; i += 400) {
      const batch = db.batch();
      for (const place of DEMO_PLACES.slice(i, i + 400)) {
        batch.set(db.collection("places").doc(place.id), place);
      }
      await batch.commit();
    }
  } else {
    // 실데이터에는 동물병원이 없으므로 데모 동물병원만 보충한다
    const vets = DEMO_PLACES.filter((p) => p.category === "VET");
    const batch = db.batch();
    for (const vet of vets) {
      batch.set(db.collection("places").doc(vet.id), vet);
    }
    await batch.commit();
    console.log(
      `실데이터(TOURAPI) 존재 → 데모 시설 시드는 동물병원 ${vets.length}곳만 보충.`,
    );
  }

  // 2) 데모 계정
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(DEMO_EMAIL);
    uid = existing.uid;
    console.log(`데모 계정 이미 존재: ${DEMO_EMAIL}`);
  } catch {
    const created = await auth.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      displayName: "멍경로 데모",
    });
    uid = created.uid;
    console.log(`데모 계정 생성: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  }

  // 3) 데모 데이터 (펫 2 + 방문/피드백 + 학습 가중치) — 현재 DB의 시설 기준으로 매칭
  const placesSnap = await db.collection("places").get();
  const places = placesSnap.docs.map((d) => d.data() as Place);
  const demo = buildDemoData(uid, places);
  const userDoc = db.collection("users").doc(uid);
  const batch = db.batch();
  for (const pet of demo.pets) {
    batch.set(userDoc.collection("pets").doc(pet.id), pet);
  }
  for (const visit of demo.visits) {
    batch.set(userDoc.collection("visits").doc(visit.id), visit);
  }
  for (const [petId, weights] of Object.entries(demo.tagPrefs)) {
    batch.set(userDoc.collection("tagPrefs").doc(petId), { weights });
  }
  await batch.commit();

  console.log("완료! 로그인: demo@mung.kr / demo1234");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exitCode = 1;
});
