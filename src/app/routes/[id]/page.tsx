import { notFound } from "next/navigation";
import RouteDetail from "@/components/RouteDetail";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function RoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const repo = getRepo();

  const route = await repo.getRoute(id);
  if (!route) notFound();

  // 미로그인 사용자도 공유된 코스는 볼 수 있다 (방문 기록 버튼만 비활성)
  const [pet, vets] = await Promise.all([
    user ? repo.getPet(user.id, route.petId) : Promise.resolve(null),
    repo.listVets(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <RouteDetail route={route} pet={pet} vets={vets} />
    </div>
  );
}
