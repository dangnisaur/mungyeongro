// 좌표 거리/이동시간 유틸. PostGIS 미사용(데모 모드) 시 하버사인으로 대체한다.

const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * 시골 국도 기준 평균 40km/h + 주차/승하차 5분 버퍼.
 * 실제 내비 시간이 아닌 코스 계획용 근사치.
 */
export function estimateTravelMinutes(km: number): number {
  if (km <= 0.05) return 0; // 사실상 같은 장소
  return Math.round((km / 40) * 60) + 5;
}
