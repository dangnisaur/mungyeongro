"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase/client";
import type { SessionUser } from "@/lib/auth-shared";

export default function UserMenu({ user }: { user: SessionUser | null }) {
  const router = useRouter();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-deep"
      >
        로그인
      </Link>
    );
  }

  if (user.isDemo) {
    return (
      <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand-deep">
        로컬 데모 모드
      </span>
    );
  }

  const logout = async () => {
    try {
      await signOut(firebaseAuth());
    } catch {
      // 클라이언트 로그아웃 실패해도 서버 세션은 지운다
    }
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-40 truncate text-xs text-muted sm:inline">
        {user.name ?? user.email}
      </span>
      <button
        onClick={logout}
        className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-brand hover:text-brand-deep"
      >
        로그아웃
      </button>
    </div>
  );
}
