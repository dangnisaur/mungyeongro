"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Pet, Place, RoutePlan } from "@/types/domain";
import { CATEGORY_LABEL, THEME_LABEL } from "@/types/domain";
import RouteMap, { type MapMarker } from "@/components/RouteMap";
import { Badge, Button, Card } from "@/components/ui";
import { addMinutes, formatMinutes } from "@/lib/utils";

interface RouteDetailProps {
  route: RoutePlan;
  pet: Pet | null;
  vets: Place[];
}

export default function RouteDetail({ route, pet, vets }: RouteDetailProps) {
  const router = useRouter();
  const [showVets, setShowVets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const markers = useMemo<MapMarker[]>(() => {
    const stopMarkers: MapMarker[] = route.stops.map((s) => ({
      id: s.placeId,
      name: s.place.name,
      lat: s.place.lat,
      lng: s.place.lng,
      order: s.order,
      kind: "stop",
    }));
    const vetMarkers: MapMarker[] = showVets
      ? vets.map((v) => ({
          id: v.id,
          name: v.name,
          lat: v.lat,
          lng: v.lng,
          kind: "vet",
        }))
      : [];
    return [...stopMarkers, ...vetMarkers];
  }, [route.stops, vets, showVets]);

  const recordVisits = async () => {
    if (!pet) return;
    setSaving(true);
    for (const stop of route.stops) {
      await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          placeId: stop.placeId,
          routeId: route.id,
        }),
      });
    }
    setSaving(false);
    setSaved(true);
    router.push("/history");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{THEME_LABEL[route.theme]}</Badge>
          {pet && (
            <Badge>
              {pet.sizeClass === "LARGE" ? "🐕" : "🐶"} {pet.name}와 함께
            </Badge>
          )}
          <Badge tone="green">
            총 {formatMinutes(route.stops.reduce((a, s) => a + s.travelMinutes + s.stayMinutes, 0))}
          </Badge>
        </div>
        <h1 className="mt-2 font-display text-3xl text-ink">{route.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* 지도 */}
        <div className="lg:col-span-3">
          <RouteMap markers={markers} drawPath className="h-80 lg:h-[430px]" />
          <div className="mt-3 flex items-center justify-between">
            <Button
              size="sm"
              variant={showVets ? "primary" : "outline"}
              onClick={() => setShowVets(!showVets)}
            >
              🏥 응급 동물병원 {showVets ? "숨기기" : "보기"}
            </Button>
            <span className="text-xs text-muted">
              이동시간은 국도 기준 추정치예요
            </span>
          </div>
          {showVets && (
            <Card className="mt-3 space-y-2 border-red-200">
              <p className="text-sm font-bold text-red-600">
                주변 동물병원 {vets.length}곳
              </p>
              {vets.map((v) => (
                <div key={v.id} className="flex items-center justify-between text-sm">
                  <span>
                    {v.isEmergencyVet && <span className="mr-1">🚨</span>}
                    {v.name}
                    <span className="ml-2 text-xs text-muted">{v.address}</span>
                  </span>
                  {v.description && (
                    <span className="text-xs text-muted">{v.description}</span>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>

        {/* 타임라인 */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-bold">하루 일정 ⏰</h2>
          <ol className="relative space-y-0 border-l-2 border-brand/30 pl-6">
            {route.stops.map((stop) => (
              <li key={stop.placeId} className="relative pb-6">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {stop.order}
                </span>
                {stop.travelMinutes > 0 && (
                  <p className="mb-1 text-xs text-muted">
                    🚗 이동 {formatMinutes(stop.travelMinutes)}
                  </p>
                )}
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold">
                        {addMinutes(route.startTime, stop.arriveOffsetMin)} ·{" "}
                        {stop.place.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {CATEGORY_LABEL[stop.place.category]} · 약{" "}
                        {formatMinutes(stop.stayMinutes)} 머물러요
                      </p>
                    </div>
                  </div>
                  {stop.place.petPolicy && (
                    <p className="mt-2 rounded-lg bg-brand-soft/60 px-2.5 py-1.5 text-xs text-brand-deep">
                      🐾 {stop.place.petPolicy}
                    </p>
                  )}
                  {stop.place.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stop.place.tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-xs text-muted">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ol>

          <div className="mt-4 space-y-2">
            <Button
              className="w-full"
              onClick={recordVisits}
              disabled={saving || saved || !pet}
            >
              {saving
                ? "기록 저장 중..."
                : saved
                  ? "저장 완료!"
                  : "📝 이 코스로 다녀왔어요 (방문 기록)"}
            </Button>
            <p className="text-center text-xs text-muted">
              방문 후 별점을 남기면 다음 추천이 더 똑똑해져요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
