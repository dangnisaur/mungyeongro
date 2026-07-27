import { redirect } from "next/navigation";
import PetManager from "@/components/PetManager";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function PetsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const pets = await (await getRepo()).listPets(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl text-ink">우리 아이 프로필 🐾</h1>
      <p className="mt-1 text-sm text-muted">
        아이의 성향을 등록하면 코스 추천이 훨씬 정확해져요.
      </p>
      <div className="mt-6">
        <PetManager pets={pets} />
      </div>
    </div>
  );
}
