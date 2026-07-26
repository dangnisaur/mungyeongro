import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { visitInputSchema } from "@/lib/schemas";

/** 방문 기록 추가 (코스 전체 방문 기록 시 stop별로 여러 번 호출) */
export async function POST(req: Request): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  const parsed = visitInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않아요" },
      { status: 400 },
    );
  }
  const visit = await getRepo().createVisit(user.id, parsed.data);
  return NextResponse.json({ visit }, { status: 201 });
}
