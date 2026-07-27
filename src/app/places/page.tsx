import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import { CATEGORY_LABEL, type PlaceCategory } from "@/types/domain";

export const dynamic = "force-dynamic";

const FILTERS: Array<{ value: PlaceCategory | "ALL"; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "NATURE", label: "자연" },
  { value: "TRAIL", label: "걷기길" },
  { value: "CULTURE", label: "문화" },
  { value: "ACTIVITY", label: "액티비티" },
  { value: "CAFE", label: "카페" },
  { value: "RESTAURANT", label: "식당" },
  { value: "STAY", label: "숙박" },
  { value: "VET", label: "동물병원" },
];

export default async function PlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const places = await (await getRepo()).listPlaces();
  const filtered =
    category && category !== "ALL"
      ? places.filter((p) => p.category === category)
      : places;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-3xl text-ink">문경 반려동물 동반 시설 🗺</h1>
      <p className="mt-1 text-sm text-muted">
        총 {places.length}곳의 동반 가능 시설 정보를 모았어요.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "ALL" ? "/places" : `/places?category=${f.value}`}
            className={
              (category ?? "ALL") === f.value
                ? "rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white"
                : "rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-muted hover:border-brand"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((place) => (
          <Card key={place.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold leading-snug">{place.name}</p>
              <Badge>{CATEGORY_LABEL[place.category]}</Badge>
            </div>
            {place.address && (
              <p className="text-xs text-muted">{place.address}</p>
            )}
            {place.petPolicy && (
              <p className="rounded-lg bg-brand-soft/60 px-2.5 py-1.5 text-xs text-brand-deep">
                🐾 {place.petPolicy}
              </p>
            )}
            {place.description && (
              <p className="text-xs text-muted">{place.description}</p>
            )}
            <div className="mt-auto flex flex-wrap gap-1 pt-1">
              {!place.allowLarge && <Badge tone="red">대형견 불가</Badge>}
              {place.tags.slice(0, 4).map((t) => (
                <span key={t} className="text-xs text-muted">
                  #{t}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
