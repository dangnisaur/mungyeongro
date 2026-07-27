// Firestore places → src/data/real/places.json 스냅샷 추출.
// Firebase 없는 환경(Vercel 데모 모드)에서도 실데이터(TourAPI)로 동작하게 한다.
// 실행: npx tsx scripts/export-places.ts  (에뮬레이터 실행 중이어야 함)
import "./load-env";

process.env.NEXT_PUBLIC_FIREBASE_EMULATOR ??= "1";

import fs from "node:fs";
import path from "node:path";
import { adminDb } from "../src/lib/firebase/admin";
import type { Place } from "../src/types/domain";

async function main(): Promise<void> {
  const snap = await adminDb().collection("places").get();
  const places = snap.docs
    .map((d) => d.data() as Place)
    .sort((a, b) => a.id.localeCompare(b.id));
  if (places.length === 0) {
    console.error("places 컬렉션이 비어 있습니다. seed:tourapi 먼저 실행하세요.");
    process.exitCode = 1;
    return;
  }
  const dest = path.join(process.cwd(), "src", "data", "real", "places.json");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify(places, null, 2), "utf-8");
  const tour = places.filter((p) => p.source === "TOURAPI").length;
  console.log(`${dest} 저장: 총 ${places.length}곳 (TOURAPI ${tour})`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exitCode = 1;
});
