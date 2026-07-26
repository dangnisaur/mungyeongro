"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase/client";
import { Button, Card, Input, Label } from "@/components/ui";

type Mode = "login" | "signup";

function friendlyError(code: string): string {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "이메일 또는 비밀번호가 맞지 않아요";
    case "auth/email-already-in-use":
      return "이미 가입된 이메일이에요. 로그인해 주세요";
    case "auth/weak-password":
      return "비밀번호는 6자 이상이어야 해요";
    case "auth/invalid-email":
      return "이메일 형식을 확인해 주세요";
    case "auth/popup-closed-by-user":
      return "로그인 창이 닫혔어요. 다시 시도해 주세요";
    default:
      return "로그인에 실패했어요. 잠시 후 다시 시도해 주세요";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const finish = async (cred: UserCredential) => {
    const idToken = await cred.user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      setError("세션 생성에 실패했어요");
      setBusy(false);
      return;
    }
    router.push("/plan");
    router.refresh();
  };

  const run = async (fn: () => Promise<UserCredential>) => {
    setBusy(true);
    setError(null);
    try {
      await finish(await fn());
    } catch (e: unknown) {
      const code =
        typeof e === "object" && e !== null && "code" in e
          ? String((e as { code: unknown }).code)
          : "";
      setError(friendlyError(code));
      setBusy(false);
    }
  };

  const submitEmail = () =>
    run(() =>
      mode === "login"
        ? signInWithEmailAndPassword(firebaseAuth(), email, password)
        : createUserWithEmailAndPassword(firebaseAuth(), email, password),
    );

  const submitGoogle = () =>
    run(() => signInWithPopup(firebaseAuth(), googleProvider));

  return (
    <Card className="mx-auto max-w-sm space-y-4">
      <div className="text-center">
        <p className="text-3xl">🐾</p>
        <h1 className="mt-1 font-display text-2xl text-ink">
          {mode === "login" ? "다시 만나서 반가워요" : "멍경로에 온 걸 환영해요"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login"
            ? "로그인하고 우리 아이 맞춤 코스를 만들어 보세요"
            : "이메일로 간단히 가입할 수 있어요"}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitEmail();
        }}
        className="space-y-3"
      >
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6자 이상"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        또는
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={submitGoogle}
        disabled={busy}
      >
        <span aria-hidden>G</span> 구글로 계속하기
      </Button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            처음이신가요?{" "}
            <button
              className="font-semibold text-brand-deep underline"
              onClick={() => setMode("signup")}
            >
              가입하기
            </button>
          </>
        ) : (
          <>
            이미 계정이 있나요?{" "}
            <button
              className="font-semibold text-brand-deep underline"
              onClick={() => setMode("login")}
            >
              로그인
            </button>
          </>
        )}
      </p>
    </Card>
  );
}
