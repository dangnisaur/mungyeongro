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

  const [pet, vets] = await Promise.all([
    repo.getPet(user.id, route.petId),
    repo.listVets(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <RouteDetail route={route} pet={pet} vets={vets} />
    </div>
  );
}
