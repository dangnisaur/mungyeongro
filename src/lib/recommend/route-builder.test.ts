import { describe, expect, it } from "vitest";
import type { Pet, Place } from "@/types/domain";
import { buildRoute } from "./route-builder";

function makePet(over: Partial<Pet> = {}): Pet {
  return {
    id: "p1",
    userId: "u1",
    name: "테스트견",
    sizeClass: "MEDIUM",
    energyLevel: 4,
    sociability: 4,
    prefersIndoor: false,
    createdAt: "2026-01-01T00:00:00Z",
    ...over,
  };
}

let seq = 0;
function makePlace(over: Partial<Place>): Place {
  seq += 1;
  return {
    id: `pl${seq}`,
    name: `장소${seq}`,
    category: "NATURE",
    lat: 36.7 + seq * 0.01,
    lng: 128.1,
    tags: ["산책"],
    indoor: false,
    allowLarge: true,
    avgStayMinutes: 60,
    isEmergencyVet: false,
    popularity: 0.5,
    source: "DEMO",
    ...over,
  };
}

const SAMPLE: Place[] = [
  makePlace({ category: "TRAIL", tags: ["산책", "숲길"], popularity: 0.9 }),
  makePlace({ category: "NATURE", tags: ["계곡", "물놀이"], popularity: 0.7 }),
  makePlace({ category: "CAFE", tags: ["커피", "테라스"], avgStayMinutes: 50 }),
  makePlace({ category: "CAFE", tags: ["커피", "간식"], avgStayMinutes: 50 }),
  makePlace({ category: "CAFE", tags: ["커피"], avgStayMinutes: 50 }),
  makePlace({ category: "RESTAURANT", tags: ["식사"], avgStayMinutes: 60 }),
  makePlace({ category: "CULTURE", tags: ["역사", "포토스팟"] }),
  makePlace({ category: "STAY", tags: ["숙박"] }),
  makePlace({ category: "VET", tags: [] }),
];

describe("buildRoute", () => {
  it("시간 예산을 초과하지 않는다", () => {
    const route = buildRoute({
      pet: makePet(),
      places: SAMPLE,
      theme: "NATURE_HEALING",
      totalMinutes: 240,
    });
    expect(route.usedMinutes).toBeLessThanOrEqual(240);
    expect(route.stops.length).toBeGreaterThan(0);
  });

  it("같은 카테고리를 연속으로 배치하지 않는다", () => {
    const route = buildRoute({
      pet: makePet(),
      places: SAMPLE,
      theme: "CAFE_FOOD",
      totalMinutes: 420,
    });
    for (let i = 1; i < route.stops.length; i++) {
      expect(route.stops[i].place.category).not.toBe(
        route.stops[i - 1].place.category,
      );
    }
  });

  it("카페는 최대 2곳까지만 넣는다", () => {
    const route = buildRoute({
      pet: makePet(),
      places: SAMPLE,
      theme: "CAFE_FOOD",
      totalMinutes: 600,
      maxStops: 8,
    });
    const cafes = route.stops.filter((s) => s.place.category === "CAFE");
    expect(cafes.length).toBeLessThanOrEqual(2);
  });

  it("당일 코스에 숙박/동물병원을 넣지 않는다", () => {
    const route = buildRoute({
      pet: makePet(),
      places: SAMPLE,
      theme: "NATURE_HEALING",
      totalMinutes: 600,
      maxStops: 8,
    });
    const cats = route.stops.map((s) => s.place.category);
    expect(cats).not.toContain("STAY");
    expect(cats).not.toContain("VET");
  });

  it("대형견 코스에는 대형견 불가 시설이 없다", () => {
    const places = [
      ...SAMPLE,
      makePlace({ category: "ACTIVITY", allowLarge: false, popularity: 1 }),
    ];
    const route = buildRoute({
      pet: makePet({ sizeClass: "LARGE" }),
      places,
      theme: "ACTIVITY",
      totalMinutes: 420,
    });
    expect(route.stops.every((s) => s.place.allowLarge)).toBe(true);
  });

  it("스팟 순서/도착시간이 일관된다 (이동+체류 누적)", () => {
    const route = buildRoute({
      pet: makePet(),
      places: SAMPLE,
      theme: "NATURE_HEALING",
      totalMinutes: 420,
    });
    let acc = 0;
    for (const stop of route.stops) {
      acc += stop.travelMinutes;
      expect(stop.arriveOffsetMin).toBe(acc);
      acc += stop.stayMinutes;
    }
    expect(route.usedMinutes).toBe(acc);
  });
});
