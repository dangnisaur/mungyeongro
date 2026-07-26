import Link from "next/link";
import Reveal from "@/components/Reveal";
import RouteMap from "@/components/RouteMap";
import { Waymark } from "@/components/ui";
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

const STEPS = [
  {
    title: "아이 프로필 등록",
    desc: "크기, 활동량, 사회성, 실내 선호까지. 1분이면 충분해요.",
  },
  {
    title: "테마와 시간 선택",
    desc: "숲길 힐링부터 액티비티까지, 반나절 또는 하루 코스로.",
  },
  {
    title: "걷고, 별점 남기기",
    desc: "피드백이 쌓일수록 아이 취향을 학습해 다음 코스가 더 좋아져요.",
  },
] as const;

/** 등고선 배경 (히어로 장식) */
function Contours() {
  const rings = [90, 150, 215, 285, 360];
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-28 h-[560px] w-[560px] text-pine"
      viewBox="0 0 720 720"
      fill="none"
    >
      {rings.map((r, i) => (
        <path
          key={r}
          d={`M ${360 - r} 360
              C ${360 - r} ${360 - r * 0.62}, ${360 - r * 0.55} ${360 - r}, 360 ${360 - r}
              C ${360 + r * 0.72} ${360 - r}, ${360 + r} ${360 - r * 0.48}, ${360 + r} 360
              C ${360 + r} ${360 + r * 0.7}, ${360 + r * 0.5} ${360 + r}, 360 ${360 + r}
              C ${360 - r * 0.68} ${360 + r}, ${360 - r} ${360 + r * 0.55}, ${360 - r} 360 Z`}
          stroke="currentColor"
          strokeOpacity={0.1 - i * 0.012}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

/** 시그니처: 단계 사이를 잇는 발자국 트레일 */
function TrailPath() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-9 hidden h-24 w-full text-pine/35 lg:block"
      viewBox="0 0 1000 100"
      preserveAspectRatio="none"
      fill="none"
    >
      <path
        d="M 60 40 C 220 90, 380 0, 500 42 C 620 84, 780 8, 940 46"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="10 9"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <Contours />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-pine/20 bg-card px-3.5 py-1.5 text-xs font-semibold text-pine">
              <span className="h-1.5 w-1.5 rounded-full bg-sunbeam" />
              문경시 특화 · 한국관광공사 공공데이터 기반
            </p>
            <h1 className="mt-5 font-display text-[2.7rem] leading-[1.18] text-ink sm:text-5xl sm:leading-[1.16]">
              우리 강아지 걸음에 맞춘
              <br />
              <span className="relative inline-block text-pine">
                문경 옛길 하루
                <svg
                  aria-hidden
                  className="absolute -bottom-2 left-0 w-full text-sunbeam"
                  viewBox="0 0 300 14"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M4 10 C 60 3, 150 12, 296 6"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
              동반 가능 시설 <b className="text-ink">{places.length}곳</b>의
              데이터에 아이의 크기·활동량·성향을 더해, 이동시간과 점심까지
              계산된 하루 코스를 만들어 드려요.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/plan"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-pine px-7 font-semibold text-white shadow-[0_4px_14px_rgba(31,74,51,0.35)] transition hover:bg-pine-deep"
              >
                코스 만들기
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/places"
                className="inline-flex h-12 items-center rounded-full border-[1.5px] border-pine/25 bg-card px-6 font-semibold text-pine transition hover:border-pine"
              >
                동반 시설 둘러보기
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted">
              무료 · 가입 1분 · 방문할수록 똑똑해지는 추천
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-[0_18px_50px_-18px_rgba(24,36,32,0.35)] ring-1 ring-line">
                <RouteMap markers={markers} className="h-[340px] lg:h-[400px]" />
              </div>
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3 shadow-[0_10px_30px_-12px_rgba(24,36,32,0.3)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-soft text-xl">
                  🐕
                </span>
                <div className="text-xs">
                  <p className="font-bold text-ink">
                    보리의 힐링 코스 · 4곳 · 6시간 37분
                  </p>
                  <p className="mt-0.5 text-muted">
                    새재 산책 → 점심 → 진남교반 물놀이 → 숲길
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-9 text-center text-xs text-muted">
              문경 전역의 동반 시설 지도 · <span className="text-pine">●</span>{" "}
              시설 · <span className="text-red-500">●</span> 동물병원
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 이렇게 써요 (시그니처 트레일) ─────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <p className="text-center text-xs font-bold tracking-[0.22em] text-pine">
            HOW IT WORKS
          </p>
          <h2 className="mt-2 text-center font-display text-3xl text-ink">
            산책하듯 간단해요
          </h2>
        </Reveal>
        <div className="relative mt-12">
          <TrailPath />
          <div className="relative grid gap-10 lg:grid-cols-3 lg:gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <div className="flex flex-col items-center text-center">
                  <Waymark n={i + 1} className="h-11 w-11 text-base" />
                  <h3 className="mt-4 font-display text-xl text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-60 text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 스토리 밴드 ───────────────────────────────────── */}
      <section className="bg-pine-deep text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.22em] text-sunbeam">
                WHY MUNGYEONG
              </p>
              <h2 className="mt-2 font-display text-3xl leading-snug">
                사라져가는 도시와,
                <br />
                자라나는 가족 이야기
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                석탄의 도시였던 문경의 인구는 절반 이하로 줄었지만, 대한민국의
                반려동물 가족은 그 어느 때보다 빠르게 늘고 있어요. 멍경로는 이
                둘을 잇습니다 — 반려 가족의 여행이 문경의 새로운 활력이 되도록.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-3">
            {[
              {
                num: "16만 → 7만",
                label: "문경시 인구 변화",
                src: "탄광 전성기 대비 · 행안부 인구감소지역 지정(2021)",
              },
              {
                num: "552만 가구",
                label: "반려동물 양육 가구",
                src: "국민 4명 중 1명 · KB 한국 반려동물 보고서(2023)",
              },
              {
                num: "6조 원",
                label: "반려동물 시장 전망",
                src: "2027년 국내 규모 · 농림축산식품부",
              },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="border-l-2 border-sunbeam/60 pl-4">
                  <p className="font-display text-3xl text-sunbeam">{s.num}</p>
                  <p className="mt-1.5 text-sm font-semibold">{s.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    {s.src}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4가지 공백 ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <p className="text-center text-xs font-bold tracking-[0.22em] text-pine">
            WHAT WE SOLVE
          </p>
          <h2 className="mt-2 text-center font-display text-3xl text-ink">
            멍경로가 채우는 4가지 공백
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {GAPS.map((gap, i) => (
            <Reveal key={gap.title} delay={i * 80}>
              <div className="group flex gap-4 rounded-2xl border border-line bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-pine/30 hover:shadow-[0_14px_34px_-16px_rgba(24,36,32,0.25)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pine-soft text-2xl transition-transform group-hover:scale-110">
                  {gap.emoji}
                </span>
                <div>
                  <h3 className="font-display text-lg text-ink">{gap.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {gap.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-pine px-6 py-14 text-center text-white">
            <span
              aria-hidden
              className="absolute -left-4 top-6 rotate-[-18deg] text-6xl opacity-10"
            >
              🐾
            </span>
            <span
              aria-hidden
              className="absolute -right-2 bottom-4 rotate-12 text-7xl opacity-10"
            >
              🐾
            </span>
            <h2 className="font-display text-3xl leading-snug">
              이번 주말, 아이와 함께
              <br className="sm:hidden" /> 문경 어때요?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
              프로필 등록부터 코스 완성까지 3분. 지금 바로 우리 아이만의 코스를
              만들어 보세요.
            </p>
            <Link
              href="/plan"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-sunbeam px-8 font-bold text-pine-deep transition hover:brightness-105"
            >
              무료로 코스 만들기 <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
