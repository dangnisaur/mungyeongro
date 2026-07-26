import { describe, expect, it } from "vitest";
import { extractTags, inferPetConstraints } from "./tag-extractor";

describe("extractTags", () => {
  it("문경새재 옛길 설명에서 산책/역사 태그를 뽑는다", () => {
    const tags = extractTags("문경새재 옛길을 따라 걷는 흙길 산책 코스");
    expect(tags).toContain("산책");
    expect(tags).toContain("역사");
  });

  it("카페 설명에서 커피/테라스 태그를 뽑는다", () => {
    const tags = extractTags("야외 테라스가 있는 로스터리 카페, 디저트 맛집");
    expect(tags).toEqual(expect.arrayContaining(["커피", "간식", "테라스"]));
  });

  it("매칭 없는 텍스트는 빈 배열", () => {
    expect(extractTags("xyz")).toEqual([]);
  });

  it("중복 키워드가 있어도 태그는 한 번만 나온다", () => {
    const tags = extractTags("산책 산책로 둘레길 걷기");
    expect(tags.filter((t) => t === "산책")).toHaveLength(1);
  });
});

describe("inferPetConstraints", () => {
  it("소형견 전용 문구에서 대형견 불가를 추론한다", () => {
    expect(inferPetConstraints("소형견만 동반 가능").allowLarge).toBe(false);
    expect(inferPetConstraints("소형견 전용").allowLarge).toBe(false);
  });

  it("일반 문구는 대형견 가능", () => {
    expect(inferPetConstraints("목줄 착용 시 전 견종 가능").allowLarge).toBe(
      true,
    );
  });

  it("실내 시설을 추론한다", () => {
    expect(inferPetConstraints("실내 전시관").indoor).toBe(true);
    expect(inferPetConstraints("야외 공원").indoor).toBe(false);
  });
});
