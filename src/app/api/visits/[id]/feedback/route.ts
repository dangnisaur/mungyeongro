import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { feedbackInputSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

/** 만족도 피드백 — 저장 즉시 태그 선호 가중치가 재계산된다 (학습 루프) */
export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  const parsed = feedbackInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "별점은 1~5점이어야 해요" },
      { status: 400 },
    );
  }
  const visit = await getRepo().setFeedback(user.id, id, parsed.data);
  if (!visit) {
    return NextResponse.json({ error: "찾을 수 없어요" }, { status: 404 });
  }
  return NextResponse.json({ visit });
}
