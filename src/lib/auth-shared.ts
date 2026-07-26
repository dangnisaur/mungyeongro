// 서버/클라이언트 공용 인증 상수·타입 (node 전용 모듈 import 금지)

export const DEMO_USER_ID = "demo-user";
export const SESSION_COOKIE = "mgr_session";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  isDemo: boolean;
}
