import { describe, expect, it } from "vitest";
import type { Pet, Place } from "@/types/domain";
import {
  feedbackBoost,
  passesHardConstraints,
  rankPlaces,
  tagAffinity,
  themeMatch,
} from "./scoring";

function makePet(over: Partial<Pet> = {}): Pet {
  return {
    id: "p1",
    userId: "u1",
    name: "테스트견",
    sizeClass: "MEDIUM",
    energyLevel: 3,
    sociability: 3,
    prefersIndoor: false,
    createdAt: "2026-01-01T00:00:00Z",
    ...over,
  };
}

function makePlace(over: Partial<Place> = {}): Place {
  return {
    id: "pl1",
    name: "테스트 장소",
    category: "NATURE",
    lat: 36.7,
    lng: 128.1,
    tags: [],
    indoor: false,
    allowLarge: true,
    avgStayMinutes: 60,
    isEmergencyVet: false,
    popularity: 0.5,
    source: "DEMO",
    ...over,
  };
}

describe("passesHardConstraints", () => {
  it("대형견은 대형견 불가 시설에서 탈락한다", () => {
    const pet = makePet({ sizeClass: "LARGE" });
    expect(passesHardConstraints(pet, makePlace({ allowLarge: false }))).toBe(
      false,
    );
    expect(passesHardConstraints(pet, makePlace({ allowLarge: true }))).toBe(
      true,
    );
  });

  it("중형견은 소형견전용 시설에서 탈락한다", () => {
    const pet = makePet({ sizeClass: "MEDIUM" });
    expect(
      passesHardConstraints(pet, makePlace({ tags: ["소형견전용"] })),
    ).toBe(false);
  });

  it("동물병원은 코스 후보에서 제외된다", () => {
    expect(passesHardConstraints(makePet(), makePlace({ category: "VET" }))).toBe(
      false,
    );
  });
});

describe("tagAffinity", () => {
  it("고활동 대형견은 오프리쉬 운동장을 실내 카페보다 선호한다", () => {
    const pet = makePet({ sizeClass: "LARGE", energyLevel: 5 });
    const run = makePlace({ tags: ["오프리쉬", "잔디마당", "대형견환영"] });
    const cafe = makePlace({ tags: ["실내", "커피"] });
    expect(tagAffinity(pet, run)).toBeGreaterThan(tagAffinity(pet, cafe));
  });

  it("실내 선호 저활동견은 실내 태그를 선호한다", () => {
    const pet = makePet({
      sizeClass: "SMALL",
      energyLevel: 1,
      prefersIndoor: true,
    });
    const indoor = makePlace({ tags: ["실내", "커피", "간식"] });
    const hike = makePlace({ tags: ["숲길", "오프리쉬"] });
    expect(tagAffinity(pet, indoor)).toBeGreaterThan(tagAffinity(pet, hike));
  });

  it("낯가리는 강아지는 북적이는 곳보다 조용한 곳을 선호한다", () => {
    const pet = makePet({ sociability: 1 });
    const quiet = makePlace({ tags: ["조용한"] });
    const crowded = makePlace({ tags: ["북적이는"] });
    expect(tagAffinity(pet, quiet)).toBeGreaterThan(tagAffinity(pet, crowded));
  });

  it("결과는 항상 0~1 범위다", () => {
    const pets = [
      makePet({ energyLevel: 1, sociability: 1 }),
      makePet({ energyLevel: 5, sociability: 5, sizeClass: "LARGE" }),
    ];
    const places = [
      makePlace({ tags: ["오프리쉬", "북적이는", "야외"] }),
      makePlace({ tags: [] }),
      makePlace({ tags: ["조용한", "실내"] }),
    ];
    for (const pet of pets) {
      for (const place of places) {
        const v = tagAffinity(pet, place);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("themeMatch", () => {
  it("역사·문화 테마에서 문화 시설이 카페보다 높다", () => {
    const culture = makePlace({ category: "CULTURE", tags: ["역사"] });
    const cafe = makePlace({ category: "CAFE", tags: ["커피"] });
    expect(themeMatch("HISTORY_CULTURE", culture)).toBeGreaterThan(
      themeMatch("HISTORY_CULTURE", cafe),
    );
  });

  it("카페·미식 테마에서는 반대다", () => {
    const culture = makePlace({ category: "CULTURE", tags: ["역사"] });
    const cafe = makePlace({ category: "CAFE", tags: ["커피", "간식"] });
    expect(themeMatch("CAFE_FOOD", cafe)).toBeGreaterThan(
      themeMatch("CAFE_FOOD", culture),
    );
  });
});

describe("feedbackBoost", () => {
  it("긍정 학습된 태그를 가진 장소는 0.5(중립)보다 높다", () => {
    const place = makePlace({ tags: ["계곡", "물놀이"] });
    expect(feedbackBoost({ 계곡: 0.8, 물놀이: 0.6 }, place)).toBeGreaterThan(
      0.5,
    );
    expect(feedbackBoost({ 계곡: -0.8 }, place)).toBeLessThan(0.5);
    expect(feedbackBoost({}, place)).toBe(0.5);
  });
});

describe("rankPlaces", () => {
  it("하드 제약 위반 장소를 제외하고 점수 내림차순으로 정렬한다", () => {
    const pet = makePet({ sizeClass: "LARGE", energyLevel: 5 });
    const places = [
      makePlace({ id: "a", tags: ["오프리쉬", "잔디마당"], popularity: 0.9 }),
      makePlace({ id: "b", allowLarge: false }),
      makePlace({ id: "c", tags: ["실내"], popularity: 0.1 }),
    ];
    const ranked = rankPlaces(pet, places, "NATURE_HEALING", {});
    expect(ranked.map((r) => r.place.id)).not.toContain("b");
    expect(ranked[0].place.id).toBe("a");
    const scores = ranked.map((r) => r.score);
    expect([...scores].sort((x, y) => y - x)).toEqual(scores);
  });
});
