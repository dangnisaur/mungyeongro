// 인증 어댑터.
// Supabase 프로젝트가 준비되면 @supabase/ssr 기반 세션 조회로 교체한다 (PROJECT.md 블로커 #1).
// 데모 모드에서는 고정 데모 사용자로 동작한다.

export const DEMO_USER_ID = "demo-user";

export interface SessionUser {
  id: string;
  email: string | null;
  isDemo: boolean;
}

export async function getSessionUser(): Promise<SessionUser> {
  // TODO(supabase): createServerClient(...).auth.getUser()로 교체
  return { id: DEMO_USER_ID, email: null, isDemo: true };
}
