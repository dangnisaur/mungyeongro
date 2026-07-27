// firebase-admin 초기화 (서버 전용).
// ⚠️ 이 모듈은 반드시 isFirebaseConfigured()가 true일 때만 (동적 import로) 로드할 것.
//    firebase-admin의 하위 의존성(jose)이 일부 서버리스 런타임에서 require 실패한다.
// - 에뮬레이터 모드: NEXT_PUBLIC_FIREBASE_EMULATOR=1 → 로컬 에뮬레이터 (자격증명 불필요)
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
import { EMULATOR_PROJECT_ID, isEmulatorMode } from "./config";

export { EMULATOR_PROJECT_ID, isEmulatorMode, isFirebaseConfigured } from "./config";

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
