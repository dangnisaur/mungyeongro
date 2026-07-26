// 서버 인증: Firebase Auth ID 토큰(쿠키) 검증.
// Firebase 미설정 시에는 로컬 데모 사용자로 동작한다.
import { cookies } from "next/headers";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";
import {
  DEMO_USER_ID,
  SESSION_COOKIE,
  type SessionUser,
} from "@/lib/auth-shared";

export { DEMO_USER_ID, SESSION_COOKIE, type SessionUser };

/**
 * 현재 세션 사용자.
 * - Firebase 모드: 쿠키의 ID 토큰 검증. 미로그인/만료 → null
 * - 로컬 모드: 항상 데모 사용자
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isFirebaseConfigured()) {
    return { id: DEMO_USER_ID, email: null, name: "데모 사용자", isDemo: true };
  }
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return {
      id: decoded.uid,
      email: decoded.email ?? null,
      name: (decoded.name as string | undefined) ?? decoded.email ?? null,
      isDemo: false,
    };
  } catch {
    return null;
  }
}
