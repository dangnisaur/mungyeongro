// repo 진입점: 환경변수에 따라 데모 모드 / DB 모드를 선택한다.
// 현재 DB 모드(Prisma/Supabase)는 미배선 상태 — PROJECT.md 블로커 #1 참고.
import { DEMO_USER_ID } from "@/lib/auth";
import { createDemoRepo } from "./demo-repo";
import type { Repo } from "./types";

let repo: Repo | null = null;

export function getRepo(): Repo {
  if (!repo) {
    // DATABASE_URL이 있으면 Prisma 구현으로 교체 예정 (Supabase 프로젝트 생성 후)
    repo = createDemoRepo(DEMO_USER_ID);
  }
  return repo;
}

export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

export type { PetInput, Repo, VisitInput } from "./types";
