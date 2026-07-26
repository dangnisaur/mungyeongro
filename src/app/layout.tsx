import type { Metadata } from "next";
import Link from "next/link";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@fontsource/jua";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import UserMenu from "@/components/UserMenu";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "멍경로 — 반려동물 동반 문경 여행 플래너",
  description:
    "우리 강아지 성향에 딱 맞는 문경 여행 코스를 만들어주는 반려동물 동반 여행 플래너",
};

const NAV = [
  { href: "/plan", label: "코스 만들기" },
  { href: "/places", label: "동반 시설" },
  { href: "/pets", label: "우리 아이" },
  { href: "/history", label: "방문 기록" },
] as const;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-line/70 bg-[rgba(247,246,241,0.85)] backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link
              href="/"
              className="group flex items-center gap-2.5"
              aria-label="멍경로 홈"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-pine text-lg shadow-[0_2px_6px_rgba(31,74,51,0.3)] transition-transform group-hover:-rotate-6">
                🐾
              </span>
              <span className="leading-tight">
                <span className="block font-display text-xl text-pine">
                  멍경로
                </span>
                <span className="block text-[10px] font-medium tracking-[0.18em] text-muted">
                  MUNGYEONG PET TRAIL
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-0.5 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-2 font-semibold text-ink/70 transition hover:bg-pine-soft hover:text-pine"
                >
                  {item.label}
                </Link>
              ))}
              <span className="ml-2">
                <UserMenu user={user} />
              </span>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-pine-deep text-white/80">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="font-display text-lg text-white">🐾 멍경로</p>
                <p className="mt-1 max-w-sm text-sm">
                  반려동물 동반 문경 여행 플래너. 공공데이터로 잇는 반려 가족과
                  문경의 하루.
                </p>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">활용 공공데이터</p>
                <a
                  href="https://api.visitkorea.or.kr/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block underline-offset-2 hover:text-white hover:underline"
                >
                  한국관광공사 TourAPI 4.0 · 반려동물 동반여행 정보
                </a>
                <a
                  href="https://www.data.go.kr/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 block underline-offset-2 hover:text-white hover:underline"
                >
                  공공데이터포털 · 동물병원 정보
                </a>
              </div>
            </div>
            <p className="mt-8 border-t border-white/15 pt-4 text-xs text-white/50">
              데모 데이터가 포함되어 있습니다. 실제 방문 전 시설에 동반 가능
              여부를 확인해 주세요.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
