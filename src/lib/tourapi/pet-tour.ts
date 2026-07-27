// 반려동물 동반여행 서비스(KorPetTourService) + 국문 관광정보(KorService1) 조합 조회
import type { Place, PlaceCategory } from "@/types/domain";
import {
  AREA_CODE_GYEONGBUK,
  SIGUNGU_CODE_MUNGYEONG,
  tourApiFetch,
} from "./client";
import { extractTags, inferPetConstraints } from "./tag-extractor";

/** KorService1 areaBasedList1 응답 항목 (필요 필드만) */
interface AreaBasedItem {
  contentid: string;
  contenttypeid: string;
  title: string;
  addr1?: string;
  addr2?: string;
  mapx?: string; // 경도
  mapy?: string; // 위도
  firstimage?: string;
  tel?: string;
}

/** KorPetTourService2 detailPetTour2 응답 항목 (필요 필드만) */
interface PetTourItem {
  contentid: string;
  acmpyTypeCd?: string; // 동반구분 (예: "전구역 동반가능")
  acmpyPsblCpam?: string; // 동반 가능 동물 (예: "중소형견 동반 가능")
  acmpyNeedMtr?: string; // 필요사항 (목줄, 입마개 등)
  etcAcmpyInfo?: string;
  relaPosesFclty?: string; // 관련 구비 시설
}

/** TourAPI contentTypeId → 서비스 카테고리 매핑 */
const CONTENT_TYPE_TO_CATEGORY: Record<string, PlaceCategory> = {
  "12": "NATURE", // 관광지
  "14": "CULTURE", // 문화시설
  "15": "ETC", // 축제/공연/행사
  "28": "ACTIVITY", // 레포츠
  "32": "STAY", // 숙박
  "38": "ETC", // 쇼핑
  "39": "RESTAURANT", // 음식점
};

/** 카테고리별 기본 체류시간(분) */
const STAY_BY_CATEGORY: Partial<Record<PlaceCategory, number>> = {
  NATURE: 80,
  TRAIL: 100,
  CULTURE: 60,
  ACTIVITY: 80,
  CAFE: 50,
  RESTAURANT: 60,
  STAY: 60,
  ETC: 40,
};

function toNumber(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** 문경시 전체 관광정보 페이지네이션 조회 */
export async function fetchMungyeongPlaces(): Promise<AreaBasedItem[]> {
  const all: AreaBasedItem[] = [];
  let page = 1;
  for (;;) {
    const { items, totalCount } = await tourApiFetch<AreaBasedItem>(
      "KorService2",
      "areaBasedList2",
      {
        areaCode: AREA_CODE_GYEONGBUK,
        sigunguCode: SIGUNGU_CODE_MUNGYEONG,
        pageNo: page,
        numOfRows: 100,
        arrange: "O",
      },
    );
    all.push(...items);
    if (all.length >= totalCount || items.length === 0) break;
    page += 1;
  }
  return all;
}

/** contentId별 반려동물 동반 정보 조회 */
export async function fetchPetTourInfo(
  contentId: string,
): Promise<PetTourItem | null> {
  const { items } = await tourApiFetch<PetTourItem>(
    "KorPetTourService2",
    "detailPetTour2",
    { contentId },
  );
  return items[0] ?? null;
}

/** 관광정보 + 반려동물 동반 정보를 서비스 Place 형태로 병합 */
export function mergeToPlace(
  base: AreaBasedItem,
  pet: PetTourItem | null,
): Place | null {
  const lat = toNumber(base.mapy);
  const lng = toNumber(base.mapx);
  if (lat === null || lng === null) return null;
  if (base.contenttypeid === "25") return null; // 여행코스는 단일 장소가 아니므로 제외

  const petPolicyParts = [
    pet?.acmpyTypeCd,
    pet?.acmpyPsblCpam,
    pet?.acmpyNeedMtr,
    pet?.etcAcmpyInfo,
  ].filter(Boolean);
  const petPolicy = petPolicyParts.join(" · ") || null;
  const text = [base.title, petPolicy ?? "", pet?.relaPosesFclty ?? ""].join(
    " ",
  );
  const constraints = inferPetConstraints(petPolicy ?? "");
  const category = CONTENT_TYPE_TO_CATEGORY[base.contenttypeid] ?? "ETC";

  return {
    id: `tour-${base.contentid}`,
    contentId: base.contentid,
    name: base.title,
    category,
    lat,
    lng,
    address: [base.addr1, base.addr2].filter(Boolean).join(" ") || null,
    phone: base.tel ?? null,
    imageUrl: base.firstimage || null,
    description: null,
    petPolicy,
    tags: extractTags(text),
    indoor: constraints.indoor,
    allowLarge: constraints.allowLarge,
    avgStayMinutes: STAY_BY_CATEGORY[category] ?? 60,
    isEmergencyVet: false,
    // 데이터 완성도 기반 기본값 + 동반 정보 검증된 곳 가점
    popularity: (base.firstimage ? 0.6 : 0.35) + (petPolicy ? 0.3 : 0),
    source: "TOURAPI",
  };
}
