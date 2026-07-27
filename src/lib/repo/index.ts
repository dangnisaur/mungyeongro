// repo 진입점: Firebase(에뮬레이터/실프로젝트) 설정이 있으면 Firestore,
// 없으면 로컬(스냅샷/데모) 저장소로 동작한다.
// firestore-repo(firebase-admin 의존)는 설정된 경우에만 동적 로드한다.
import { DEMO_USER_ID } from "@/lib/auth-shared";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { createDemoRepo } from "./demo-repo";
import type { Repo } from "./types";

let repo: Repo | null = null;

export async function getRepo(): Promise<Repo> {
  if (!repo) {
    if (isFirebaseConfigured()) {
      const { createFirestoreRepo } = await import("./firestore-repo");
      repo = createFirestoreRepo();
    } else {
      repo = createDemoRepo(DEMO_USER_ID);
    }
  }
  return repo;
}

/** Firebase 미설정 → 로컬 모드 (로그인 없이 데모 사용자로 동작) */
export function isDemoMode(): boolean {
  return !isFirebaseConfigured();
}

export type { PetInput, Repo, VisitInput } from "./types";
