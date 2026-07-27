import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { petInputSchema } from "@/lib/schemas";

const UNAUTHORIZED = { error: "로그인이 필요해요" };

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
  const pets = await (await getRepo()).listPets(user.id);
  return NextResponse.json({ pets });
}

export async function POST(req: Request): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) return NextResponse.json(UNAUTHORIZED, { status: 401 });
  const parsed = petInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않아요" },
      { status: 400 },
    );
  }
  const pet = await (await getRepo()).createPet(user.id, parsed.data);
  return NextResponse.json({ pet }, { status: 201 });
}
