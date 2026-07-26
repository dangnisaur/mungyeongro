import Link from "next/link";
import RouteMap from "@/components/RouteMap";
import { Badge, Card } from "@/components/ui";
import { getRepo } from "@/lib/repo";

export const dynamic = "force-dynamic";

const GAPS = [
  {
    emoji: "🔍",
    title: "정보 공백",
    desc: "동반 가능 여부가 흩어져 있고 믿기 어려워요. 공공데이터로 한곳에 모았어요.",
  },
  {
    emoji: "🐕",
    title: "개인화 공백",
    desc: "대형견과 소형견이 갈 수 있는 곳은 달라요. 우리 아이 성향에 맞춰 걸러드려요.",
  },
  {
    emoji: "🧭",
    title: "동선 공백",
    desc: "장소만 알려주는 앱은 많죠. 멍경로는 이동시간까지 계산해 하루 코스로 엮어요.",
  },
  {
    emoji: "🏥",
    title: "안전 공백",
    desc: "낯선 여행지에서의 응급상황. 코스 옆에 항상 동물병원을 함께 보여드려요.",
  },
] as const;

export default async function LandingPage() {
  const repo = getRepo();
  const places = await repo.listPlaces();
  const markers = places.map((p) => ({
    id: p.id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    kind: p.category === "VET" ? ("vet" as const) : ("place" as const),
  }));

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-soft/70 to-background">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
          <div>
            <Badge>🐾 문경시 특화 반려동물 동반 여행 플래너</Badge>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">
              우리 강아지에게
              <br />
              딱 맞는 <span className="text-brand-deep">문경 하루</span>를
              만들어 드려요
            </h1>
            <p className="mt-4 text-muted">
              한국관광공사 공공데이터로 모은 문경의 반려동물 동반 시설{" "}
              <b className="text-foreground">{places.length}곳</b>.
              아이의 크기·활동량·성향을 학습해 세상에 하나뿐인 코스를 짜 드립니다.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/plan"
                className="inline-flex h-12 items-center rounded-full bg-brand px-7 font-semibold text-white shadow-sm transition hover:bg-brand-deep"
              >
                코스 만들기 ✨
              </Link>
              <Link
                href="/places"
                className="inline-flex h-12 items-center rounded-full border border-line bg-card px-7 font-semibold transition hover:border-brand hover:text-brand-deep"
              >
                동반 시설 보기
              </Link>
            </div>
          </div>
          <div>
            <RouteMap markers={markers} className="h-72 lg:h-80" />
            <p className="mt-2 text-center text-xs text-muted">
              문경시 반려동물 동반 시설 지도 · 🟢 시설 · 🔴 동물병원
            </p>
          </div>
        </div>
      </section>

      {/* 스토리텔링 통계 */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">
          사라져가는 도시와, 자라나는 가족 이야기
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted">
          석탄의 도시였던 문경의 인구는 절반 이하로 줄었지만, 대한민국의
          반려동물 가족은 그 어느 때보다 빠르게 늘고 있어요. 멍경로는 이 둘을
          잇습니다 — 반려 가족의 여행이 문경의 새로운 활력이 되도록.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <p className="text-3xl font-extrabold text-brand-deep">16만 → 7만</p>
            <p className="mt-1 text-sm font-semibold">문경시 인구 변화</p>
            <p className="mt-1 text-xs text-muted">
              탄광 전성기(1970년대) 대비 절반 이하로 감소, 행정안전부 지정
              인구감소지역 (2021)
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-extrabold text-brand-deep">552만 가구</p>
            <p className="mt-1 text-sm font-semibold">반려동물 양육 가구</p>
            <p className="mt-1 text-xs text-muted">
              국민 4명 중 1명이 반려 가족 (KB 한국 반려동물 보고서, 2023)
            </p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-extrabold text-brand-deep">6조 원</p>
            <p className="mt-1 text-sm font-semibold">반려동물 연관 시장 전망</p>
            <p className="mt-1 text-xs text-muted">
              2027년 국내 시장 규모 전망 (농림축산식품부)
            </p>
          </Card>
        </div>
      </section>

      {/* 4가지 공백 */}
      <section className="bg-brand-soft/40">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold">
            멍경로가 채우는 4가지 공백
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GAPS.map((gap) => (
              <Card key={gap.title}>
                <p className="text-3xl">{gap.emoji}</p>
                <p className="mt-2 font-bold">{gap.title}</p>
                <p className="mt-1 text-sm text-muted">{gap.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 방법 */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">이렇게 써요</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "아이 프로필 등록",
              desc: "크기, 활동량, 사회성, 실내 선호까지. 1분이면 충분해요.",
            },
            {
              step: "2",
              title: "테마와 시간 선택",
              desc: "자연·힐링부터 액티비티까지, 반나절 또는 하루 코스로.",
            },
            {
              step: "3",
              title: "다녀온 뒤 별점",
              desc: "피드백이 쌓일수록 아이 취향을 학습해 더 똑똑해져요.",
            },
          ].map((s) => (
            <Card key={s.step} className="relative pt-8">
              <span className="absolute -top-4 left-5 flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">
                {s.step}
              </span>
              <p className="font-bold">{s.title}</p>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 공공데이터 크레딧 */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          <p className="text-sm font-semibold text-muted">활용 공공데이터</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm">
            <a
              href="https://api.visitkorea.or.kr/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line bg-card px-4 py-2 font-medium transition hover:border-brand"
            >
              🇰🇷 한국관광공사 TourAPI 4.0 — 반려동물 동반여행 정보
            </a>
            <a
              href="https://www.data.go.kr/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line bg-card px-4 py-2 font-medium transition hover:border-brand"
            >
              📂 공공데이터포털 — 동물병원 정보
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
