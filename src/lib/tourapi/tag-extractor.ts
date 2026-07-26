// 시설 이름/설명/동반 조건 텍스트에서 서비스 태그를 추출한다.
// 추천 알고리즘(src/lib/recommend)의 tagAffinity가 이 태그 어휘를 사용한다.

/** 서비스 전체에서 쓰는 통제 태그 어휘 */
export const TAG_VOCAB = [
  "산책",
  "숲길",
  "계곡",
  "물놀이",
  "잔디마당",
  "포토스팟",
  "전망",
  "실내",
  "야외",
  "테라스",
  "조용한",
  "북적이는",
  "역사",
  "체험",
  "간식",
  "커피",
  "식사",
  "숙박",
  "오프리쉬", // 목줄 없이 뛸 수 있는 공간
  "대형견환영",
  "소형견전용",
  "액티비티",
] as const;

export type ServiceTag = (typeof TAG_VOCAB)[number];

/** 키워드 → 태그 매핑 규칙 (텍스트에 키워드가 포함되면 태그 부여) */
const RULES: Array<{ tag: ServiceTag; keywords: string[] }> = [
  { tag: "산책", keywords: ["산책", "둘레길", "옛길", "걷기", "트레킹", "공원"] },
  { tag: "숲길", keywords: ["숲", "수목", "삼림", "편백", "산림"] },
  { tag: "계곡", keywords: ["계곡", "폭포"] },
  { tag: "물놀이", keywords: ["물놀이", "수영", "천변", "강변", "호수", "저수지"] },
  { tag: "잔디마당", keywords: ["잔디", "마당", "운동장", "광장"] },
  { tag: "포토스팟", keywords: ["포토", "사진", "인생샷", "세트장", "야경"] },
  { tag: "전망", keywords: ["전망", "뷰", "케이블카", "모노레일", "정상"] },
  { tag: "실내", keywords: ["실내", "박물관", "미술관", "전시"] },
  { tag: "야외", keywords: ["야외", "노천", "야영", "캠핑"] },
  { tag: "테라스", keywords: ["테라스", "루프탑", "야외석", "야외 좌석"] },
  { tag: "조용한", keywords: ["조용", "한적", "힐링", "산사", "사찰"] },
  { tag: "북적이는", keywords: ["축제", "시장", "인기", "핫플"] },
  { tag: "역사", keywords: ["역사", "유적", "문화재", "성곽", "서원", "박물관", "사찰", "산성", "옛길"] },
  { tag: "체험", keywords: ["체험", "만들기", "도자기", "공방"] },
  { tag: "간식", keywords: ["디저트", "베이커리", "빵", "케이크", "간식"] },
  { tag: "커피", keywords: ["카페", "커피", "로스터리"] },
  { tag: "식사", keywords: ["식당", "맛집", "한정식", "국수", "약돌", "구이", "음식"] },
  { tag: "숙박", keywords: ["펜션", "호텔", "리조트", "글램핑", "숙소", "민박"] },
  { tag: "오프리쉬", keywords: ["오프리쉬", "오프리시", "노리드", "목줄 없이", "운동장"] },
  { tag: "대형견환영", keywords: ["대형견", "모든 견종", "견종 무관"] },
  { tag: "소형견전용", keywords: ["소형견만", "소형견 전용", "10kg 이하", "5kg 이하"] },
  { tag: "액티비티", keywords: ["레일바이크", "짚라인", "패러글라이딩", "모노레일", "레포츠", "카트"] },
];

/** 텍스트에서 태그 배열 추출 (중복 제거, 어휘 순서 유지) */
export function extractTags(text: string): string[] {
  const normalized = text.toLowerCase();
  const found = new Set<ServiceTag>();
  for (const { tag, keywords } of RULES) {
    if (keywords.some((k) => normalized.includes(k.toLowerCase()))) {
      found.add(tag);
    }
  }
  return TAG_VOCAB.filter((t) => found.has(t));
}

export interface PetConstraints {
  /** 대형견 동반 가능 여부 */
  allowLarge: boolean;
  /** 실내 시설 여부 */
  indoor: boolean;
}

/** 동반 조건 원문에서 하드 제약 추론 */
export function inferPetConstraints(petPolicy: string): PetConstraints {
  const p = petPolicy.toLowerCase();
  const smallOnly =
    p.includes("소형견만") ||
    p.includes("소형견 전용") ||
    p.includes("소형") === true &&
      !p.includes("대형") &&
      (p.includes("이하") || p.includes("만 가능"));
  const indoor =
    p.includes("실내") || p.includes("박물관") || p.includes("전시");
  return { allowLarge: !smallOnly, indoor };
}
