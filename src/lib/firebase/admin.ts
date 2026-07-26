// firebase-admin 초기화 (서버 전용).
// - 에뮬레이터 모드: NEXT_PUBLIC_FIREBASE_EMULATOR=1 → 로컬 에뮬레이터에 연결 (자격증명 불필요)
// - 프로덕션 모드: FIREBASE_SERVICE_ACCOUNT(JSON) 또는 ADC 자격증명 사용
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type Credential,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

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

let app: App | null = null;

function getAdminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  if (isEmulatorMode()) {
    // admin SDK는 이 env를 보고 에뮬레이터로 라우팅한다
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
    app = initializeApp({ projectId: EMULATOR_PROJECT_ID });
    return app;
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  let credential: Credential | undefined;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    credential = cert(JSON.parse(raw) as Record<string, string>);
  }
  app = initializeApp({ projectId, credential });
  return app;
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}
