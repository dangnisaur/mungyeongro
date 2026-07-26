import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <span aria-hidden>🐾</span>
              <span>
                멍경로
                <span className="ml-1.5 text-xs font-medium text-muted">
                  문경 반려여행
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 font-medium text-foreground/80 transition hover:bg-brand-soft hover:text-brand-deep"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-line bg-brand-soft/40">
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
            <p className="font-semibold text-foreground/80">
              멍경로 — 반려동물 동반 문경 여행 플래너
            </p>
            <p className="mt-2">
              본 서비스는{" "}
              <a
                href="https://api.visitkorea.or.kr/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-brand-deep underline underline-offset-2"
              >
                한국관광공사 TourAPI 4.0
              </a>{" "}
              반려동물 동반여행 정보를 활용합니다.
            </p>
            <p className="mt-1 text-xs">
              데모 데이터가 포함되어 있으며 실제 방문 전 시설에 동반 가능 여부를
              확인해 주세요.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
