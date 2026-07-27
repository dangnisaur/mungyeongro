import Link from "next/link";
import { redirect } from "next/navigation";
import FeedbackStars from "@/components/FeedbackStars";
import { Badge, Card } from "@/components/ui";
import { getSessionUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { CATEGORY_LABEL } from "@/types/domain";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const repo = await getRepo();
  const [visits, pets, places] = await Promise.all([
    repo.listVisits(user.id),
    repo.listPets(user.id),
    repo.listPlaces(),
  ]);
  const petMap = new Map(pets.map((p) => [p.id, p]));
  const placeMap = new Map(places.map((p) => [p.id, p]));

  const pending = visits.filter((v) => !v.feedback).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl text-ink">방문 기록 📝</h1>
      <p className="mt-1 text-sm text-muted">
        별점을 남기면 아이의 취향을 학습해서 다음 코스에 반영해요.
        {pending > 0 && (
          <span className="ml-1 font-medium text-brand-deep">
            아직 별점을 안 남긴 방문이 {pending}건 있어요!
          </span>
        )}
      </p>

      {visits.length === 0 ? (
        <Card className="mt-6 text-center">
          <p className="text-4xl">🧳</p>
          <p className="mt-2 font-semibold">아직 방문 기록이 없어요</p>
          <p className="mt-1 text-sm text-muted">
            <Link href="/plan" className="text-brand-deep underline">
              첫 코스를 만들고
            </Link>{" "}
            다녀온 뒤 기록을 남겨보세요.
          </p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {visits.map((visit) => {
            const place = placeMap.get(visit.placeId);
            const pet = petMap.get(visit.petId);
            if (!place) return null;
            return (
              <Card key={visit.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">
                    {place.name}
                    <Badge className="ml-2">{CATEGORY_LABEL[place.category]}</Badge>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Date(visit.visitedAt).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                    })}
                    {pet && ` · ${pet.name}와 함께`}
                  </p>
                </div>
                <FeedbackStars
                  visitId={visit.id}
                  initialRating={visit.feedback?.rating ?? null}
                />
              </Card>
            );
          })}
        </ul>
      )}
    </div>
  );
}
