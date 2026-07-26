import { describe, expect, it } from "vitest";
import { updateTagWeights } from "./learning";

describe("updateTagWeights", () => {
  it("만족(5점)은 태그 가중치를 +방향으로 올린다", () => {
    const next = updateTagWeights({}, ["계곡", "물놀이"], 5);
    expect(next["계곡"]).toBeGreaterThan(0);
    expect(next["물놀이"]).toBeGreaterThan(0);
  });

  it("불만족(1점)은 -방향으로 내린다", () => {
    const next = updateTagWeights({ 계곡: 0.3 }, ["계곡"], 1);
    expect(next["계곡"]).toBeLessThan(0.3);
  });

  it("보통(3점)은 0으로 수렴시킨다", () => {
    const next = updateTagWeights({ 계곡: 0.8 }, ["계곡"], 3);
    expect(Math.abs(next["계곡"])).toBeLessThan(0.8);
  });

  it("반복 학습해도 -1~+1을 벗어나지 않는다", () => {
    let w = {};
    for (let i = 0; i < 50; i++) w = updateTagWeights(w, ["산책"], 5);
    expect((w as Record<string, number>)["산책"]).toBeLessThanOrEqual(1);
    let w2 = {};
    for (let i = 0; i < 50; i++) w2 = updateTagWeights(w2, ["산책"], 1);
    expect((w2 as Record<string, number>)["산책"]).toBeGreaterThanOrEqual(-1);
  });

  it("입력 객체를 변경하지 않는다", () => {
    const original = { 산책: 0.5 };
    updateTagWeights(original, ["산책"], 5);
    expect(original["산책"]).toBe(0.5);
  });
});
