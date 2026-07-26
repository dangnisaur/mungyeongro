// repo 진입점: Firebase(에뮬레이터/실프로젝트) 설정이 있으면 Firestore,
// 없으면 로컬 파일 저장소로 동작한다.
import { DEMO_USER_ID } from "@/lib/auth-shared";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { createDemoRepo } from "./demo-repo";
import { createFirestoreRepo } from "./firestore-repo";
import type { Repo } from "./types";

let repo: Repo | null = null;

export function getRepo(): Repo {
  if (!repo) {
    repo = isFirebaseConfigured()
      ? createFirestoreRepo()
      : createDemoRepo(DEMO_USER_ID);
  }
  return repo;
}

/** Firebase 미설정 → 로컬 데모 모드 (로그인 없이 데모 사용자로 동작) */
export function isDemoMode(): boolean {
  return !isFirebaseConfigured();
}

export type { PetInput, Repo, VisitInput } from "./types";
