// Firebase 설정 판별 (firebase-admin을 import하지 않는 가벼운 모듈).
// firebase-admin은 Vercel 데모 모드에서 로드 자체가 실패할 수 있으므로(jose ESM 이슈),
// 설정이 있을 때만 동적 import 경로(admin.ts)를 타야 한다.

export const EMULATOR_PROJECT_ID = "demo-munggyeongro";

export function isEmulatorMode(): boolean {
  return process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "1";
}

/** Firebase 백엔드를 쓸 수 있는 상태인가 (에뮬레이터 또는 실제 프로젝트 설정) */
export function isFirebaseConfigured(): boolean {
  return (
    isEmulatorMode() ||
    Boolean(
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        (process.env.FIREBASE_SERVICE_ACCOUNT ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS),
    )
  );
}
