import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { petInputSchema } from "@/lib/schemas";

type Params = { params: Promise<{ id: string }> };

const UNAUTHORIZED = { error: "로그인이 필요해요" };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
  const parsed = petInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않아요" },
      { status: 400 },
    );
  }
  const pet = await getRepo().updatePet(user.id, id, parsed.data);
  if (!pet) {
    return NextResponse.json({ error: "찾을 수 없어요" }, { status: 404 });
  }
  return NextResponse.json({ pet });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
  const ok = await getRepo().deletePet(user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "찾을 수 없어요" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
