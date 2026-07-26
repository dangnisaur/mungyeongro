import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { buildRoute } from "@/lib/recommend";
import { getRepo } from "@/lib/repo";
import { planInputSchema } from "@/lib/schemas";

/** 프로필 × 테마 × 시간 → 추천 코스 생성 */
export async function POST(req: Request): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }
  const parsed = planInputSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않아요" },
      { status: 400 },
    );
  }
  const { petId, theme, totalMinutes, startTime } = parsed.data;
  const repo = getRepo();

  const pet = await repo.getPet(user.id, petId);
  if (!pet) {
    return NextResponse.json(
      { error: "반려동물 프로필을 찾을 수 없어요" },
      { status: 404 },
    );
  }

  const [places, learned] = await Promise.all([
    repo.listPlaces(),
    repo.getTagWeights(user.id, petId),
  ]);

  const built = buildRoute({
    pet,
    places,
    theme,
    totalMinutes,
    startTime,
    learned,
  });
  if (built.stops.length === 0) {
    return NextResponse.json(
      { error: "조건에 맞는 코스를 만들지 못했어요. 시간을 늘려보세요." },
      { status: 422 },
    );
  }

  const route = await repo.createRoute({
    userId: user.id,
    petId,
    title: built.title,
    theme,
    totalMinutes,
    startTime,
    stops: built.stops,
  });
  return NextResponse.json({ routeId: route.id }, { status: 201 });
}
