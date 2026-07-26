// 한국관광공사 TourAPI 4.0 공통 클라이언트.
// 서버 전용 — TOURAPI_SERVICE_KEY는 클라이언트 번들에 절대 노출하지 않는다.
// (seed 스크립트에서도 쓰므로 "server-only" 패키지 대신 컨벤션으로 강제한다)

const BASE = "https://apis.data.go.kr/B551011";

/** 경상북도 */
export const AREA_CODE_GYEONGBUK = "35";
/**
 * 문경시 시군구코드 (TourAPI areaCode2 조회 결과 기준).
 * 키 발급 후 `npm run db:seed` 실행 시 실제 코드로 검증/보정된다.
 */
export const SIGUNGU_CODE_MUNGYEONG = process.env.TOURAPI_MUNGYEONG_CODE ?? "7";

export class TourApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TourApiError";
  }
}

export function hasTourApiKey(): boolean {
  return Boolean(process.env.TOURAPI_SERVICE_KEY);
}

interface TourApiResponse<T> {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: { item?: T[] } | "";
      totalCount?: number;
    };
  };
}

/**
 * TourAPI 공통 호출. items 배열과 totalCount를 반환한다.
 * @param service 예: "KorPetTourService", "KorService1"
 * @param operation 예: "areaBasedList", "detailPetTour"
 */
export async function tourApiFetch<T>(
  service: string,
  operation: string,
  params: Record<string, string | number>,
): Promise<{ items: T[]; totalCount: number }> {
  const key = process.env.TOURAPI_SERVICE_KEY;
  if (!key) {
    throw new TourApiError(
      "TOURAPI_SERVICE_KEY가 설정되지 않았습니다 (.env 참고)",
    );
  }

  const search = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "MungGyeongRo",
    _type: "json",
    numOfRows: "100",
    pageNo: "1",
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ),
  });
  // serviceKey는 이미 디코딩된 키를 그대로 인코딩해야 하므로 별도 부착
  const url = `${BASE}/${service}/${operation}?serviceKey=${encodeURIComponent(key)}&${search.toString()}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new TourApiError(`TourAPI HTTP ${res.status}`, res.status);
  }
  const json = (await res.json()) as TourApiResponse<T>;
  const header = json.response?.header;
  if (header?.resultCode && header.resultCode !== "0000") {
    throw new TourApiError(
      `TourAPI 오류 ${header.resultCode}: ${header.resultMsg ?? ""}`,
    );
  }
  const body = json.response?.body;
  const items =
    body && typeof body.items === "object" && body.items?.item
      ? body.items.item
      : [];
  return { items, totalCount: body?.totalCount ?? items.length };
}
