import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";
import { SESSION_COOKIE } from "@/lib/auth-shared";

const bodySchema = z.object({ idToken: z.string().min(10) });

/** 로그인: 클라이언트가 받은 Firebase ID 토큰을 검증하고 세션 쿠키로 저장 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "로컬 데모 모드" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  try {
    await adminAuth().verifyIdToken(parsed.data.idToken);
  } catch {
    return NextResponse.json({ error: "유효하지 않은 토큰" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, parsed.data.idToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // ID 토큰 수명(1시간)과 동일
    path: "/",
  });
  return res;
}

/** 로그아웃 */
export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
