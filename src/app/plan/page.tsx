import PlanForm from "@/components/PlanForm";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const user = await getSessionUser();
  const pets = await getRepo().listPets(user.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">맞춤 코스 만들기 ✨</h1>
      <p className="mt-1 text-sm text-muted">
        아이의 성향과 지난 여행 피드백을 반영해 문경 하루 코스를 만들어 드려요.
      </p>
      <div className="mt-6">
        <PlanForm pets={pets} />
      </div>
    </div>
  );
}
