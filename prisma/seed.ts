// TourAPI → DB 시드 스크립트 (실데이터 모드 전용)
// 실행: npm run db:seed  (사전에 .env의 TOURAPI_SERVICE_KEY, DATABASE_URL 필요 + prisma generate)
//
// 데모 모드(키 없음)에서는 src/data/demo/places.ts가 자동 사용되므로 이 스크립트가 필요 없다.
import {
  fetchMungyeongPlaces,
  fetchPetTourInfo,
  mergeToPlace,
} from "../src/lib/tourapi/pet-tour";
import { hasTourApiKey } from "../src/lib/tourapi/client";
import type { Place } from "../src/types/domain";

/** 이 스크립트가 쓰는 최소한의 Prisma 클라이언트 형태 */
interface MinimalPrisma {
  place: {
    upsert(args: {
      where: { contentId: string };
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<unknown>;
  };
  $disconnect(): Promise<void>;
}

async function loadPrisma(): Promise<MinimalPrisma> {
  try {
    const mod = (await import("../src/generated/prisma/client")) as {
      PrismaClient: new () => MinimalPrisma;
    };
    return new mod.PrismaClient();
  } catch {
    throw new Error(
      "Prisma 클라이언트가 없습니다. DATABASE_URL 설정 후 `npm run db:generate && npm run db:push`를 먼저 실행하세요.",
    );
  }
}

function toRow(p: Place): Record<string, unknown> {
  return {
    contentId: p.contentId,
    name: p.name,
    category: p.category,
    lat: p.lat,
    lng: p.lng,
    address: p.address,
    phone: p.phone,
    imageUrl: p.imageUrl,
    description: p.description,
    petPolicy: p.petPolicy,
    tags: p.tags,
    indoor: p.indoor,
    allowLarge: p.allowLarge,
    avgStayMinutes: p.avgStayMinutes,
    isEmergencyVet: p.isEmergencyVet,
    popularity: p.popularity,
    source: p.source,
  };
}

async function main(): Promise<void> {
  if (!hasTourApiKey()) {
    console.error(
      "TOURAPI_SERVICE_KEY가 없습니다. 공공데이터포털에서 발급 후 .env에 설정하세요.\n" +
        "키 없이도 앱은 데모 모드(내장 시드)로 동작합니다.",
    );
    process.exitCode = 1;
    return;
  }
  const prisma = await loadPrisma();

  console.log("문경시 관광정보 조회 중...");
  const items = await fetchMungyeongPlaces();
  console.log(`총 ${items.length}건. 반려동물 동반 정보 병합 중...`);

  let saved = 0;
  for (const item of items) {
    let petInfo = null;
    try {
      petInfo = await fetchPetTourInfo(item.contentid);
    } catch {
      // 동반 정보 없는 콘텐츠는 건너뛰지 않고 기본값으로 저장
    }
    const place = mergeToPlace(item, petInfo);
    if (!place || !place.contentId) continue;
    await prisma.place.upsert({
      where: { contentId: place.contentId },
      update: toRow(place),
      create: toRow(place),
    });
    saved += 1;
    if (saved % 20 === 0) console.log(`  ${saved}건 저장...`);
  }
  console.log(`완료: ${saved}건 저장됨`);
  await prisma.$disconnect();
}

main().catch((e: unknown) => {
  console.error(e);
  process.exitCode = 1;
});
