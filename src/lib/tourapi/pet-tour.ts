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

/** KorPetTourService detailPetTour 응답 항목 (필요 필드만) */
interface PetTourItem {
  contentid: string;
  acmpyTypeCd?: string; // 동반구분 (동반가능 등)
  acmpyPsblCpam?: string; // 동반 가능 동물 (예: "개(소형,중형)")
  acmpyNeedMtr?: string; // 필요사항 (목줄, 입마개 등)
  etcAcmpyInfo?: string;
  relaPosesFclty?: string; // 관련 구비 시설
}

/** TourAPI contentTypeId → 서비스 카테고리 매핑 */
const CONTENT_TYPE_TO_CATEGORY: Record<string, PlaceCategory> = {
  "12": "NATURE", // 관광지
  "14": "CULTURE", // 문화시설
  "28": "ACTIVITY", // 레포츠
  "32": "STAY", // 숙박
  "38": "ETC", // 쇼핑
  "39": "RESTAURANT", // 음식점
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
      "KorService1",
      "areaBasedList1",
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
    "KorPetTourService",
    "detailPetTour",
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

  const petPolicyParts = [
    pet?.acmpyPsblCpam,
    pet?.acmpyNeedMtr,
    pet?.etcAcmpyInfo,
  ].filter(Boolean);
  const petPolicy = petPolicyParts.join(" · ") || null;
  const text = [base.title, petPolicy ?? "", pet?.relaPosesFclty ?? ""].join(
    " ",
  );
  const constraints = inferPetConstraints(petPolicy ?? "");

  return {
    id: `tour-${base.contentid}`,
    contentId: base.contentid,
    name: base.title,
    category: CONTENT_TYPE_TO_CATEGORY[base.contenttypeid] ?? "ETC",
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
    avgStayMinutes: 60,
    isEmergencyVet: false,
    popularity: base.firstimage ? 0.7 : 0.4, // 데이터 완성도 기반 기본값
    source: "TOURAPI",
  };
}
