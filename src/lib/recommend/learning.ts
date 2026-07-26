// 피드백 학습 루프: 방문 만족도 → 태그별 선호 가중치 갱신 (지수이동평균)
import type { TagWeights } from "@/types/domain";

/** 학습률 */
const ALPHA = 0.3;

/**
 * 만족도(1~5)를 -1~+1 목표값으로 바꿔 방문 장소의 태그 가중치를 EMA로 갱신한다.
 * 반환값은 새 객체 (입력 불변).
 */
export function updateTagWeights(
  weights: TagWeights,
  placeTags: string[],
  rating: number,
): TagWeights {
  const clamped = Math.min(5, Math.max(1, rating));
  const target = (clamped - 3) / 2; // 1→-1, 3→0, 5→+1
  const next: TagWeights = { ...weights };
  for (const tag of placeTags) {
    const prev = next[tag] ?? 0;
    next[tag] = Number((prev + ALPHA * (target - prev)).toFixed(4));
  }
  return next;
}
