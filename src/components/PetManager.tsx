"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Pet } from "@/types/domain";
import { SIZE_LABEL } from "@/types/domain";
import { Badge, Button, Card, Input, Label, Select, Textarea } from "@/components/ui";

interface FormState {
  name: string;
  breed: string;
  sizeClass: Pet["sizeClass"];
  weightKg: string;
  ageYears: string;
  energyLevel: number;
  sociability: number;
  prefersIndoor: boolean;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  breed: "",
  sizeClass: "SMALL",
  weightKg: "",
  ageYears: "",
  energyLevel: 3,
  sociability: 3,
  prefersIndoor: false,
  notes: "",
};

function toForm(pet: Pet): FormState {
  return {
    name: pet.name,
    breed: pet.breed ?? "",
    sizeClass: pet.sizeClass,
    weightKg: pet.weightKg?.toString() ?? "",
    ageYears: pet.ageYears?.toString() ?? "",
    energyLevel: pet.energyLevel,
    sociability: pet.sociability,
    prefersIndoor: pet.prefersIndoor,
    notes: pet.notes ?? "",
  };
}

function toPayload(f: FormState) {
  return {
    name: f.name,
    breed: f.breed || null,
    sizeClass: f.sizeClass,
    weightKg: f.weightKg ? Number(f.weightKg) : null,
    ageYears: f.ageYears ? Number(f.ageYears) : null,
    energyLevel: f.energyLevel,
    sociability: f.sociability,
    prefersIndoor: f.prefersIndoor,
    notes: f.notes || null,
  };
}

const LEVEL_LABEL = ["", "매우 낮음", "낮음", "보통", "높음", "매우 높음"];

export default function PetManager({ pets }: { pets: Pet[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null); // pet id | "new" | null
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const openNew = () => {
    setForm(EMPTY);
    setEditing("new");
    setError(null);
  };
  const openEdit = (pet: Pet) => {
    setForm(toForm(pet));
    setEditing(pet.id);
    setError(null);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const isNew = editing === "new";
    const res = await fetch(isNew ? "/api/pets" : `/api/pets/${editing}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "저장에 실패했어요");
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (pet: Pet) => {
    if (!window.confirm(`${pet.name} 프로필을 삭제할까요? 방문 기록도 함께 지워져요.`)) return;
    await fetch(`/api/pets/${pet.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {pets.map((pet) => (
          <Card key={pet.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold">
                  {pet.sizeClass === "LARGE" ? "🐕" : "🐶"} {pet.name}
                  <span className="ml-2 text-sm font-normal text-muted">
                    {pet.breed ?? "견종 미상"}
                    {pet.ageYears != null && ` · ${pet.ageYears}살`}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge>{SIZE_LABEL[pet.sizeClass]}</Badge>
                  <Badge tone="green">활동량 {LEVEL_LABEL[pet.energyLevel]}</Badge>
                  <Badge tone="green">사회성 {LEVEL_LABEL[pet.sociability]}</Badge>
                  {pet.prefersIndoor && <Badge>실내 선호</Badge>}
                </div>
              </div>
            </div>
            {pet.notes && <p className="text-sm text-muted">{pet.notes}</p>}
            <div className="mt-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(pet)}>
                수정
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(pet)}>
                삭제
              </Button>
            </div>
          </Card>
        ))}
        <button
          onClick={openNew}
          className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line text-muted transition hover:border-brand hover:text-brand-deep"
        >
          <span className="text-3xl">➕</span>
          <span className="text-sm font-medium">새 프로필 등록</span>
        </button>
      </div>

      {editing !== null && (
        <Card className="space-y-4 border-brand/40">
          <h2 className="text-lg font-bold">
            {editing === "new" ? "새 프로필 등록" : "프로필 수정"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="pet-name">이름 *</Label>
              <Input
                id="pet-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 콩이"
              />
            </div>
            <div>
              <Label htmlFor="pet-breed">견종</Label>
              <Input
                id="pet-breed"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                placeholder="예: 말티즈"
              />
            </div>
            <div>
              <Label htmlFor="pet-size">크기</Label>
              <Select
                id="pet-size"
                value={form.sizeClass}
                onChange={(e) =>
                  setForm({ ...form, sizeClass: e.target.value as Pet["sizeClass"] })
                }
              >
                <option value="SMALL">소형견 (10kg 미만)</option>
                <option value="MEDIUM">중형견 (10~25kg)</option>
                <option value="LARGE">대형견 (25kg 이상)</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pet-weight">몸무게(kg)</Label>
                <Input
                  id="pet-weight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pet-age">나이(살)</Label>
                <Input
                  id="pet-age"
                  type="number"
                  min="0"
                  value={form.ageYears}
                  onChange={(e) => setForm({ ...form, ageYears: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="pet-energy">
                활동량 — {LEVEL_LABEL[form.energyLevel]}
              </Label>
              <input
                id="pet-energy"
                type="range"
                min="1"
                max="5"
                value={form.energyLevel}
                onChange={(e) =>
                  setForm({ ...form, energyLevel: Number(e.target.value) })
                }
                className="w-full accent-[#1f4a33]"
              />
            </div>
            <div>
              <Label htmlFor="pet-social">
                사회성 — {LEVEL_LABEL[form.sociability]}
              </Label>
              <input
                id="pet-social"
                type="range"
                min="1"
                max="5"
                value={form.sociability}
                onChange={(e) =>
                  setForm({ ...form, sociability: Number(e.target.value) })
                }
                className="w-full accent-[#1f4a33]"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.prefersIndoor}
                onChange={(e) =>
                  setForm({ ...form, prefersIndoor: e.target.checked })
                }
                className="h-4 w-4 accent-[#1f4a33]"
              />
              실내 활동을 더 좋아해요
            </label>
            <div className="sm:col-span-2">
              <Label htmlFor="pet-notes">메모</Label>
              <Textarea
                id="pet-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="예: 낯가림이 있어요 / 물을 좋아해요"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submit} disabled={busy}>
              {busy ? "저장 중..." : "저장"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              취소
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
