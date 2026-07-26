// 공용 도메인 타입 — prisma/schema.prisma와 1:1 대응.
// 데모 모드(DB 없음)에서도 동일 타입을 쓰기 위해 생성 클라이언트와 별도로 정의한다.

export type SizeClass = "SMALL" | "MEDIUM" | "LARGE";

export type PlaceCategory =
  | "NATURE"
  | "TRAIL"
  | "CAFE"
  | "RESTAURANT"
  | "STAY"
  | "CULTURE"
  | "ACTIVITY"
  | "VET"
  | "ETC";

export type Theme =
  | "NATURE_HEALING"
  | "CAFE_FOOD"
  | "HISTORY_CULTURE"
  | "ACTIVITY";

export type DataSource = "TOURAPI" | "DEMO" | "MANUAL";

export interface Pet {
  id: string;
  userId: string;
  name: string;
  breed?: string | null;
  sizeClass: SizeClass;
  weightKg?: number | null;
  ageYears?: number | null;
  /** 1(저활동) ~ 5(고활동) */
  energyLevel: number;
  /** 1(낯가림) ~ 5(사교적) */
  sociability: number;
  prefersIndoor: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface Place {
  id: string;
  contentId?: string | null;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  petPolicy?: string | null;
  tags: string[];
  indoor: boolean;
  allowLarge: boolean;
  avgStayMinutes: number;
  isEmergencyVet: boolean;
  /** 0~1 */
  popularity: number;
  source: DataSource;
}

export interface RouteStop {
  order: number;
  placeId: string;
  place: Place;
  /** 코스 시작 기준 도착 시각(분) */
  arriveOffsetMin: number;
  stayMinutes: number;
  /** 이전 스팟에서의 이동시간(분) */
  travelMinutes: number;
}

export interface RoutePlan {
  id: string;
  userId: string;
  petId: string;
  title: string;
  theme: Theme;
  totalMinutes: number;
  /** HH:mm */
  startTime: string;
  stops: RouteStop[];
  createdAt: string;
}

export interface Feedback {
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface Visit {
  id: string;
  userId: string;
  petId: string;
  placeId: string;
  routeId?: string | null;
  visitedAt: string;
  feedback?: Feedback | null;
}

/** (userId, petId) 스코프의 태그별 학습 가중치. -1 ~ +1 */
export type TagWeights = Record<string, number>;

export const THEME_LABEL: Record<Theme, string> = {
  NATURE_HEALING: "자연·힐링",
  CAFE_FOOD: "카페·미식",
  HISTORY_CULTURE: "역사·문화",
  ACTIVITY: "액티비티",
};

export const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  NATURE: "자연",
  TRAIL: "걷기길",
  CAFE: "카페",
  RESTAURANT: "식당",
  STAY: "숙박",
  CULTURE: "문화",
  ACTIVITY: "액티비티",
  VET: "동물병원",
  ETC: "기타",
};

export const SIZE_LABEL: Record<SizeClass, string> = {
  SMALL: "소형견",
  MEDIUM: "중형견",
  LARGE: "대형견",
};
