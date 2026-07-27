// TourAPI → Firestore 시드 (실데이터 모드).
// 실행: npm run seed:tourapi  (.env에 TOURAPI_SERVICE_KEY 필요)
// 에뮬레이터 또는 실제 Firebase 프로젝트 어느 쪽이든 동일하게 동작한다.
import "./load-env";
import {
  fetchMungyeongPlaces,
  fetchPetTourInfo,
  mergeToPlace,
} from "../src/lib/tourapi/pet-tour";
import { hasTourApiKey } from "../src/lib/tourapi/client";
import { adminDb } from "../src/lib/firebase/admin";

async function main(): Promise<void> {
  if (!hasTourApiKey()) {
    console.error(
      "TOURAPI_SERVICE_KEY가 없습니다. 공공데이터포털에서 발급 후 .env에 설정하세요.\n" +
        "키 없이도 앱은 내장 시드(seed:demo)로 동작합니다.",
    );
    process.exitCode = 1;
    return;
  }
  const db = adminDb();

  console.log("문경시 관광정보 조회 중...");
  const items = await fetchMungyeongPlaces();
  console.log(`총 ${items.length}건. 반려동물 동반 정보 병합 중...`);

  let saved = 0;
  let withPetInfo = 0;
  for (const item of items) {
    let petInfo = null;
    try {
      petInfo = await fetchPetTourInfo(item.contentid);
    } catch {
      // 동반 정보 없는 콘텐츠는 기본값으로 저장
    }
    const place = mergeToPlace(item, petInfo);
    if (!place) continue;
    if (place.petPolicy) withPetInfo += 1;
    await db.collection("places").doc(place.id).set(place);
    saved += 1;
    if (saved % 20 === 0) console.log(`  ${saved}건 저장...`);
  }
  console.log(`실데이터 ${saved}건 저장 (동반 정보 확인 ${withPetInfo}건)`);

  // 실데이터가 들어왔으면 데모 시설은 제거한다 (동물병원은 실데이터가 없어 유지)
  if (saved > 0) {
    const demoSnap = await db
      .collection("places")
      .where("source", "==", "DEMO")
      .get();
    let removed = 0;
    const batch = db.batch();
    for (const doc of demoSnap.docs) {
      if ((doc.data() as { category?: string }).category !== "VET") {
        batch.delete(doc.ref);
        removed += 1;
      }
    }
    await batch.commit();
    console.log(`데모 시설 ${removed}건 제거 (데모 동물병원은 유지)`);
  }
}

main().catch((e: unknown) => {
  console.error(e);
  process.exitCode = 1;
});
