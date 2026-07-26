// 데모 모드용 문경시 반려동물 동반 시설 시드 (110+곳).
//
// ⚠️ 이 데이터는 데모/개발용이다.
//  - 주요 명소는 실존 장소 기반이지만 좌표·동반 조건은 근사치이며 검증되지 않았다.
//  - 카페/식당/숙소/병원 등 상호는 데모용 가상 상호다.
//  - 제출 전 TourAPI 키를 발급받아 `npm run db:seed`로 실데이터로 교체할 것 (PROJECT.md 결정 로그 #2).
import type { Place, PlaceCategory } from "@/types/domain";

type Curated = {
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address?: string;
  petPolicy?: string;
  tags: string[];
  indoor?: boolean;
  allowLarge?: boolean;
  stay?: number;
  pop?: number;
  desc?: string;
};

// ── 1) 실존 명소 기반 큐레이션 (좌표 근사) ───────────────────────────
const CURATED: Curated[] = [
  {
    name: "문경새재도립공원 1관문 산책로",
    category: "TRAIL",
    lat: 36.7622,
    lng: 128.0641,
    address: "문경시 문경읍 새재로",
    petPolicy: "목줄 필수 · 배변봉투 지참",
    tags: ["산책", "숲길", "역사", "포토스팟", "야외", "대형견환영"],
    stay: 120,
    pop: 0.95,
    desc: "맨발로도 걷는 흙길. 반려견과 함께 걷기 좋은 완만한 옛길이 3관문까지 이어진다.",
  },
  {
    name: "문경새재 오픈세트장",
    category: "CULTURE",
    lat: 36.7568,
    lng: 128.0662,
    address: "문경시 문경읍 새재로",
    petPolicy: "목줄 필수 · 실내 세트 출입 제한",
    tags: ["역사", "포토스팟", "야외", "산책"],
    stay: 90,
    pop: 0.9,
    desc: "사극 촬영지로 유명한 세트장. 한복과 반려견 사진 명소.",
  },
  {
    name: "옛길박물관 앞뜰",
    category: "CULTURE",
    lat: 36.7443,
    lng: 128.0785,
    address: "문경시 문경읍 새재로",
    petPolicy: "실내 전시실은 동반 불가, 야외 뜰만 가능",
    tags: ["역사", "산책", "야외"],
    stay: 40,
    pop: 0.6,
  },
  {
    name: "문경생태미로공원",
    category: "NATURE",
    lat: 36.7461,
    lng: 128.0772,
    address: "문경시 문경읍",
    petPolicy: "목줄 필수",
    tags: ["산책", "잔디마당", "야외", "체험"],
    stay: 60,
    pop: 0.7,
  },
  {
    name: "고모산성",
    category: "CULTURE",
    lat: 36.6013,
    lng: 128.1306,
    address: "문경시 마성면",
    petPolicy: "목줄 필수",
    tags: ["역사", "전망", "산책", "포토스팟", "조용한", "대형견환영"],
    stay: 80,
    pop: 0.75,
    desc: "진남교반이 한눈에 내려다보이는 성곽길. 한적해서 낯가리는 강아지에게도 좋다.",
  },
  {
    name: "진남교반",
    category: "NATURE",
    lat: 36.5985,
    lng: 128.1282,
    address: "문경시 마성면",
    petPolicy: "목줄 필수",
    tags: ["계곡", "물놀이", "전망", "포토스팟", "야외"],
    stay: 60,
    pop: 0.8,
    desc: "경북팔경 1경. 강변 자갈밭에서 물놀이하는 반려견들을 흔히 볼 수 있다.",
  },
  {
    name: "문경 철로자전거 진남역",
    category: "ACTIVITY",
    lat: 36.6002,
    lng: 128.1295,
    address: "문경시 마성면",
    petPolicy: "소형견 안고 탑승 가능 · 대형견 불가",
    tags: ["액티비티", "전망", "포토스팟"],
    allowLarge: false,
    stay: 70,
    pop: 0.85,
  },
  {
    name: "오미자테마터널",
    category: "ACTIVITY",
    lat: 36.6045,
    lng: 128.1352,
    address: "문경시 마성면",
    petPolicy: "케이지/유모차 이용 시 동반 가능",
    tags: ["실내", "체험", "포토스팟", "소형견전용"],
    indoor: true,
    allowLarge: false,
    stay: 50,
    pop: 0.65,
  },
  {
    name: "문경단산 모노레일 승강장 광장",
    category: "ACTIVITY",
    lat: 36.7228,
    lng: 128.1006,
    address: "문경시 문경읍",
    petPolicy: "모노레일 탑승은 케이지 필수",
    tags: ["액티비티", "전망", "야외"],
    stay: 90,
    pop: 0.8,
  },
  {
    name: "가은 오픈세트장",
    category: "CULTURE",
    lat: 36.6503,
    lng: 128.0607,
    address: "문경시 가은읍",
    petPolicy: "목줄 필수",
    tags: ["역사", "포토스팟", "야외", "산책"],
    stay: 80,
    pop: 0.7,
  },
  {
    name: "문경석탄박물관 야외전시장",
    category: "CULTURE",
    lat: 36.6497,
    lng: 128.0552,
    address: "문경시 가은읍",
    petPolicy: "실내 전시관 동반 불가, 야외만 가능",
    tags: ["역사", "체험", "야외"],
    stay: 50,
    pop: 0.55,
  },
  {
    name: "쌍용계곡",
    category: "NATURE",
    lat: 36.5578,
    lng: 127.9912,
    address: "문경시 농암면",
    petPolicy: "자유 이용 (쓰레기 되가져가기)",
    tags: ["계곡", "물놀이", "조용한", "야외", "대형견환영"],
    stay: 90,
    pop: 0.6,
  },
  {
    name: "용추계곡",
    category: "NATURE",
    lat: 36.6739,
    lng: 127.9821,
    address: "문경시 가은읍 완장리",
    petPolicy: "목줄 권장",
    tags: ["계곡", "물놀이", "숲길", "조용한", "대형견환영"],
    stay: 90,
    pop: 0.65,
  },
  {
    name: "김룡사 숲길",
    category: "NATURE",
    lat: 36.7315,
    lng: 128.2402,
    address: "문경시 산북면",
    petPolicy: "경내는 목줄 필수·조용히",
    tags: ["숲길", "조용한", "역사", "산책"],
    stay: 70,
    pop: 0.5,
    desc: "일주문까지 이어지는 전나무 숲길이 여름에도 서늘하다.",
  },
  {
    name: "경천호 둘레길",
    category: "NATURE",
    lat: 36.6825,
    lng: 128.3012,
    address: "문경시 동로면",
    petPolicy: "목줄 필수",
    tags: ["산책", "물놀이", "전망", "조용한", "대형견환영"],
    stay: 80,
    pop: 0.45,
  },
  {
    name: "주흘산 여궁폭포 초입",
    category: "NATURE",
    lat: 36.7701,
    lng: 128.0855,
    address: "문경시 문경읍",
    petPolicy: "목줄 필수",
    tags: ["숲길", "계곡", "산책", "조용한", "대형견환영"],
    stay: 100,
    pop: 0.55,
  },
  {
    name: "대야산 용추 주차장 산책로",
    category: "TRAIL",
    lat: 36.6712,
    lng: 127.9805,
    address: "문경시 가은읍",
    petPolicy: "목줄 필수",
    tags: ["숲길", "계곡", "산책", "대형견환영"],
    stay: 90,
    pop: 0.5,
  },
  {
    name: "문경도자기전시관 앞마당",
    category: "CULTURE",
    lat: 36.7439,
    lng: 128.0791,
    address: "문경시 문경읍",
    petPolicy: "실내 동반 불가, 야외만",
    tags: ["체험", "역사", "야외"],
    stay: 40,
    pop: 0.45,
  },
  {
    name: "영강 수변공원",
    category: "NATURE",
    lat: 36.5893,
    lng: 128.1867,
    address: "문경시 점촌동",
    petPolicy: "목줄 필수 · 배변봉투 지참",
    tags: ["산책", "잔디마당", "물놀이", "야외", "대형견환영"],
    stay: 60,
    pop: 0.6,
    desc: "시내에서 가장 가까운 반려견 산책 코스. 저녁 산책 인기 지점.",
  },
  {
    name: "모전공원",
    category: "NATURE",
    lat: 36.5934,
    lng: 128.1919,
    address: "문경시 모전동",
    petPolicy: "목줄 필수",
    tags: ["산책", "잔디마당", "야외"],
    stay: 40,
    pop: 0.5,
  },
  {
    name: "문경새재 하늘재길",
    category: "TRAIL",
    lat: 36.7856,
    lng: 128.1235,
    address: "문경시 문경읍 관음리",
    petPolicy: "목줄 필수",
    tags: ["숲길", "역사", "산책", "조용한", "대형견환영"],
    stay: 110,
    pop: 0.5,
  },
];

// ── 2) 데모용 가상 상호 (카페/식당/숙소/병원) ────────────────────────
// 좌표는 문경 주요 권역(새재 입구, 점촌 시내, 가은, 마성) 주변에 결정론적으로 분산.
const HUBS = [
  { lat: 36.744, lng: 128.078 }, // 문경읍(새재 입구)
  { lat: 36.588, lng: 128.187 }, // 점촌 시내
  { lat: 36.65, lng: 128.06 }, // 가은
  { lat: 36.6, lng: 128.13 }, // 마성(진남교반)
];

const CAFE_NAMES = [
  "새재앞마당", "달빛테라스", "몽몽가든", "숲속작은집", "오미자하우스",
  "포레스트독", "산아래커피", "옛길로스터리", "왈츠앤도그", "진남뷰카페",
  "홍시나무", "가은살롱", "코기잡화점", "흙길베이커리", "문경마루",
  "리버독", "새재브루잉", "온담", "뜰안의봄", "구름쉼터",
  "새재연가", "담쟁이", "멍베이커리", "솔바람", "윤슬카페",
  "히든포레", "동로찻집", "산북다방", "초코와바닐라", "노을언덕",
];
const RESTAURANT_NAMES = [
  "약돌한우마당", "새재묵조밥", "옛날손칼국수", "가은약돌구이", "산채향",
  "진남매운탕", "점촌옹심이", "문경약돌돼지", "황토가마솥", "느티나무식당",
  "새재비빔밥", "오미자막국수", "돌담집", "청운식당", "강변쏘가리",
  "산북두부마을", "동로송어촌", "메밀꽃집", "가마솥순두부", "약돌숯불촌",
  "새재전집", "호계반상", "마성기사식당", "영순국밥", "점촌불백",
];
const STAY_NAMES = [
  "멍스테이 문경", "새재글램핑", "숲소리펜션", "달맞이독채", "가은힐링스테이",
  "리트리트문경", "반달곰캠핑장", "온새미로펜션", "별헤는밤글램핑", "물소리펜션",
  "새재한옥스테이", "구름아래독채", "포어페스테이", "동로별장", "산들바람캠핑장",
];
const PLAY_NAMES = [
  "새재반려견놀이터", "점촌펫파크", "멍멍운동장 문경", "가은도그런",
  "문경셀프펫워시", "점촌애견용품백화점", "펫픽닉가든", "리버사이드도그런",
];
const VETS: Curated[] = [
  {
    name: "문경중앙동물병원",
    category: "VET",
    lat: 36.5901,
    lng: 128.1848,
    address: "문경시 점촌동",
    tags: [],
    indoor: true,
    desc: "야간 응급 진료 가능 (데모 정보)",
  },
  {
    name: "점촌동물메디컬센터",
    category: "VET",
    lat: 36.5862,
    lng: 128.1902,
    address: "문경시 점촌동",
    tags: [],
    indoor: true,
    desc: "주말 진료 (데모 정보)",
  },
  {
    name: "문경읍온누리동물병원",
    category: "VET",
    lat: 36.7418,
    lng: 128.0812,
    address: "문경시 문경읍",
    tags: [],
    indoor: true,
  },
  {
    name: "가은행복동물병원",
    category: "VET",
    lat: 36.6488,
    lng: 128.0623,
    address: "문경시 가은읍",
    tags: [],
    indoor: true,
  },
];

/** index 기반 결정론적 지터 (데모 데이터 재현성) */
function jitter(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 0.02; // 약 ±1km
}

function makeGenerated(): Curated[] {
  const out: Curated[] = [];
  CAFE_NAMES.forEach((n, i) => {
    const hub = HUBS[i % HUBS.length];
    const large = i % 3 !== 0;
    out.push({
      name: `카페 ${n}`,
      category: "CAFE",
      lat: hub.lat + jitter(i, 1),
      lng: hub.lng + jitter(i, 2),
      address: "문경시 (데모 상호)",
      petPolicy: large
        ? "전 견종 동반 가능 · 야외 테라스 보유"
        : "소형견만 실내 동반 가능",
      tags: large
        ? ["커피", "간식", "테라스", "야외", "대형견환영"]
        : ["커피", "간식", "실내", "소형견전용"],
      indoor: !large,
      allowLarge: large,
      stay: 50,
      pop: 0.35 + (i % 5) * 0.1,
    });
  });
  RESTAURANT_NAMES.forEach((n, i) => {
    const hub = HUBS[(i + 1) % HUBS.length];
    const terrace = i % 2 === 0;
    out.push({
      name: n,
      category: "RESTAURANT",
      lat: hub.lat + jitter(i + 40, 3),
      lng: hub.lng + jitter(i + 40, 4),
      address: "문경시 (데모 상호)",
      petPolicy: terrace
        ? "야외 좌석에서 동반 가능"
        : "케이지 지참 시 동반 가능",
      tags: terrace ? ["식사", "테라스", "야외"] : ["식사", "실내"],
      indoor: !terrace,
      allowLarge: terrace,
      stay: 60,
      pop: 0.3 + (i % 5) * 0.1,
    });
  });
  STAY_NAMES.forEach((n, i) => {
    const hub = HUBS[(i + 2) % HUBS.length];
    out.push({
      name: n,
      category: "STAY",
      lat: hub.lat + jitter(i + 80, 5),
      lng: hub.lng + jitter(i + 80, 6),
      address: "문경시 (데모 상호)",
      petPolicy: "전 객실 반려동물 동반 · 추가 요금",
      tags: ["숙박", "잔디마당", "야외", "오프리쉬", "대형견환영"],
      stay: 60,
      pop: 0.4 + (i % 4) * 0.1,
    });
  });
  PLAY_NAMES.forEach((n, i) => {
    const hub = HUBS[(i + 3) % HUBS.length];
    const isShop = n.includes("용품") || n.includes("워시");
    out.push({
      name: n,
      category: isShop ? "ETC" : "ACTIVITY",
      lat: hub.lat + jitter(i + 120, 7),
      lng: hub.lng + jitter(i + 120, 8),
      address: "문경시 (데모 상호)",
      petPolicy: isShop ? "전 견종 환영" : "접종 완료 견만 입장 · 오프리쉬 가능",
      tags: isShop
        ? ["실내", "체험"]
        : ["오프리쉬", "잔디마당", "야외", "북적이는", "대형견환영"],
      indoor: isShop,
      stay: isShop ? 30 : 80,
      pop: 0.45 + (i % 4) * 0.1,
    });
  });
  return out;
}

function toPlace(c: Curated, idx: number): Place {
  return {
    id: `demo-${String(idx + 1).padStart(3, "0")}`,
    contentId: null,
    name: c.name,
    category: c.category,
    lat: Number(c.lat.toFixed(5)),
    lng: Number(c.lng.toFixed(5)),
    address: c.address ?? null,
    phone: null,
    imageUrl: null,
    description: c.desc ?? null,
    petPolicy: c.petPolicy ?? null,
    tags: c.tags,
    indoor: c.indoor ?? false,
    allowLarge: c.allowLarge ?? true,
    avgStayMinutes: c.stay ?? 60,
    isEmergencyVet:
      c.category === "VET" ? (c.desc?.includes("응급") ?? false) : false,
    popularity: c.pop ?? 0.5,
    source: "DEMO",
  };
}

export const DEMO_PLACES: Place[] = [
  ...CURATED,
  ...makeGenerated(),
  ...VETS,
].map(toPlace);
