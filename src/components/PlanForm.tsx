"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Pet, Theme } from "@/types/domain";
import { SIZE_LABEL, THEME_LABEL } from "@/types/domain";
import { Button, Card, Label, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

const THEMES: Array<{ value: Theme; emoji: string; desc: string }> = [
  { value: "NATURE_HEALING", emoji: "🌿", desc: "숲길·계곡·조용한 산책" },
  { value: "CAFE_FOOD", emoji: "☕", desc: "동반 카페와 맛집 위주" },
  { value: "HISTORY_CULTURE", emoji: "🏯", desc: "새재 옛길·세트장·산성" },
  { value: "ACTIVITY", emoji: "🎢", desc: "레일바이크·운동장·물놀이" },
];

const DURATIONS = [
  { minutes: 240, label: "반나절", sub: "약 4시간" },
  { minutes: 420, label: "하루", sub: "약 7시간" },
  { minutes: 600, label: "1박 없이 꽉 찬 하루", sub: "약 10시간" },
];

export default function PlanForm({ pets }: { pets: Pet[] }) {
  const router = useRouter();
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [theme, setTheme] = useState<Theme>("NATURE_HEALING");
  const [minutes, setMinutes] = useState(420);
  const [startTime, setStartTime] = useState("10:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (pets.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-4xl">🐶</p>
        <p className="mt-2 font-semibold">아직 등록된 아이가 없어요</p>
        <p className="mt-1 text-sm text-muted">
          먼저 반려동물 프로필을 등록하면 맞춤 코스를 만들 수 있어요.
        </p>
        <Link href="/pets" className="mt-4 inline-block">
          <Button>프로필 등록하러 가기</Button>
        </Link>
      </Card>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ petId, theme, totalMinutes: minutes, startTime }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "코스 생성에 실패했어요");
      setBusy(false);
      return;
    }
    const { routeId } = (await res.json()) as { routeId: string };
    router.push(`/routes/${routeId}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. 아이 선택 */}
      <section>
        <h2 className="mb-3 font-bold">1. 누구랑 떠나나요?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => setPetId(pet.id)}
              className={cn(
                "rounded-2xl border-2 bg-card p-4 text-left transition",
                petId === pet.id
                  ? "border-brand shadow-sm"
                  : "border-line hover:border-brand/50",
              )}
            >
              <p className="font-bold">
                {pet.sizeClass === "LARGE" ? "🐕" : "🐶"} {pet.name}
                <span className="ml-2 text-xs font-normal text-muted">
                  {SIZE_LABEL[pet.sizeClass]}
                  {pet.breed && ` · ${pet.breed}`}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted">
                활동량 {"●".repeat(pet.energyLevel)}
                {"○".repeat(5 - pet.energyLevel)} · 사회성{" "}
                {"●".repeat(pet.sociability)}
                {"○".repeat(5 - pet.sociability)}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 2. 테마 */}
      <section>
        <h2 className="mb-3 font-bold">2. 어떤 하루를 보내고 싶나요?</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "rounded-2xl border-2 bg-card p-4 text-left transition",
                theme === t.value
                  ? "border-brand shadow-sm"
                  : "border-line hover:border-brand/50",
              )}
            >
              <p className="text-2xl">{t.emoji}</p>
              <p className="mt-1 text-sm font-bold">{THEME_LABEL[t.value]}</p>
              <p className="mt-0.5 text-xs text-muted">{t.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 3. 시간 */}
      <section>
        <h2 className="mb-3 font-bold">3. 얼마나 머무르나요?</h2>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((d) => (
            <button
              key={d.minutes}
              onClick={() => setMinutes(d.minutes)}
              className={cn(
                "rounded-2xl border-2 bg-card p-4 text-center transition",
                minutes === d.minutes
                  ? "border-brand shadow-sm"
                  : "border-line hover:border-brand/50",
              )}
            >
              <p className="text-sm font-bold">{d.label}</p>
              <p className="mt-0.5 text-xs text-muted">{d.sub}</p>
            </button>
          ))}
        </div>
        <div className="mt-3 w-40">
          <Label htmlFor="start-time">출발 시각</Label>
          <Select
            id="start-time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </Select>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button size="lg" onClick={submit} disabled={busy || !petId} className="w-full sm:w-auto">
        {busy ? "코스 만드는 중... 🐾" : "맞춤 코스 만들기 ✨"}
      </Button>
    </div>
  );
}
