"use client";

// 지도 컴포넌트.
// NEXT_PUBLIC_KAKAO_MAP_KEY가 있으면 카카오맵 SDK를, 없으면 SVG 폴백 지도를 렌더한다.
// (블로커 #3: 키 발급 전까지 폴백이 기본 동작)
import { useEffect, useMemo, useRef, useState } from "react";

export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** 코스 순서 (있으면 번호 마커 + 경로선) */
  order?: number;
  kind: "stop" | "vet" | "place";
}

interface RouteMapProps {
  markers: MapMarker[];
  className?: string;
  /** true면 order 순서로 경로선을 그린다 */
  drawPath?: boolean;
}

// ── 카카오맵 SDK 최소 타입 ──────────────────────────────────────
interface KakaoLatLng {
  __brand: "latlng";
}
interface KakaoMap {
  setBounds(bounds: KakaoBounds): void;
}
interface KakaoBounds {
  extend(p: KakaoLatLng): void;
}
interface KakaoMaps {
  load(cb: () => void): void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (el: HTMLElement, opts: { center: KakaoLatLng; level: number }) => KakaoMap;
  LatLngBounds: new () => KakaoBounds;
  Marker: new (opts: { map: KakaoMap; position: KakaoLatLng; title: string }) => unknown;
  Polyline: new (opts: {
    map: KakaoMap;
    path: KakaoLatLng[];
    strokeWeight: number;
    strokeColor: string;
    strokeStyle: string;
  }) => unknown;
  CustomOverlay: new (opts: {
    map: KakaoMap;
    position: KakaoLatLng;
    content: string;
    yAnchor: number;
  }) => unknown;
}

function getKakao(): KakaoMaps | null {
  const w = window as unknown as { kakao?: { maps?: KakaoMaps } };
  return w.kakao?.maps ?? null;
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

function KakaoRouteMap({ markers, className, drawPath }: RouteMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !KAKAO_KEY) return;

    const render = () => {
      const maps = getKakao();
      if (!maps) return setFailed(true);
      maps.load(() => {
        const center = new maps.LatLng(36.68, 128.12);
        const map = new maps.Map(el, { center, level: 10 });
        const bounds = new maps.LatLngBounds();
        const pathPoints: KakaoLatLng[] = [];

        for (const m of markers) {
          const pos = new maps.LatLng(m.lat, m.lng);
          bounds.extend(pos);
          new maps.Marker({ map, position: pos, title: m.name });
          if (m.order !== undefined) {
            pathPoints[m.order - 1] = pos;
            new maps.CustomOverlay({
              map,
              position: pos,
              yAnchor: 2.4,
              content: `<div style="background:#ea8a3c;color:#fff;border-radius:9999px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">${m.order}</div>`,
            });
          }
        }
        if (drawPath && pathPoints.filter(Boolean).length > 1) {
          new maps.Polyline({
            map,
            path: pathPoints.filter(Boolean),
            strokeWeight: 4,
            strokeColor: "#ea8a3c",
            strokeStyle: "shortdash",
          });
        }
        if (markers.length > 0) map.setBounds(bounds);
      });
    };

    if (getKakao()) {
      render();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
    script.async = true;
    script.onload = render;
    script.onerror = () => setFailed(true);
    document.head.appendChild(script);
  }, [markers, drawPath]);

  if (failed) return <FallbackMap markers={markers} className={className} drawPath={drawPath} />;
  return <div ref={ref} className={className} />;
}

// ── SVG 폴백 지도 ───────────────────────────────────────────────
function FallbackMap({ markers, className, drawPath }: RouteMapProps) {
  const projected = useMemo(() => {
    if (markers.length === 0) return [];
    const lats = markers.map((m) => m.lat);
    const lngs = markers.map((m) => m.lng);
    const minLat = Math.min(...lats) - 0.02;
    const maxLat = Math.max(...lats) + 0.02;
    const minLng = Math.min(...lngs) - 0.02;
    const maxLng = Math.max(...lngs) + 0.02;
    const spanLat = Math.max(maxLat - minLat, 0.01);
    const spanLng = Math.max(maxLng - minLng, 0.01);
    return markers.map((m) => ({
      ...m,
      x: 6 + ((m.lng - minLng) / spanLng) * 88,
      y: 6 + ((maxLat - m.lat) / spanLat) * 88,
    }));
  }, [markers]);

  const path = useMemo(() => {
    if (!drawPath) return "";
    const stops = projected
      .filter((m) => m.order !== undefined)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return stops.map((s, i) => `${i === 0 ? "M" : "L"}${s.x},${s.y}`).join(" ");
  }, [projected, drawPath]);

  return (
    <div className={className}>
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-line bg-[#f4ecdc]">
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="문경시 약도">
          {/* 배경 지형 느낌 */}
          <defs>
            <radialGradient id="hill" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#e8ddc4" />
              <stop offset="100%" stopColor="#f4ecdc" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#hill)" />
          <g stroke="#e3d5ba" strokeWidth="0.2">
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`v${i}`} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" />
            ))}
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} />
            ))}
          </g>
          <path
            d="M -5 70 Q 25 55 45 68 T 105 62"
            fill="none"
            stroke="#bcd4e6"
            strokeWidth="2.5"
            opacity="0.8"
          />
          {path && (
            <path
              d={path}
              fill="none"
              stroke="#ea8a3c"
              strokeWidth="1.1"
              strokeDasharray="2.4 1.6"
              strokeLinecap="round"
            />
          )}
          {projected.map((m) => (
            <g key={m.id}>
              {m.kind === "vet" ? (
                <g>
                  <circle cx={m.x} cy={m.y} r="2.4" fill="#e25555" />
                  <path
                    d={`M ${m.x - 1.1} ${m.y} H ${m.x + 1.1} M ${m.x} ${m.y - 1.1} V ${m.y + 1.1}`}
                    stroke="#fff"
                    strokeWidth="0.7"
                  />
                </g>
              ) : m.order !== undefined ? (
                <g>
                  <circle cx={m.x} cy={m.y} r="3.4" fill="#ea8a3c" stroke="#fff" strokeWidth="0.7" />
                  <text
                    x={m.x}
                    y={m.y + 1.3}
                    textAnchor="middle"
                    fontSize="3.4"
                    fontWeight="700"
                    fill="#fff"
                  >
                    {m.order}
                  </text>
                </g>
              ) : (
                <circle cx={m.x} cy={m.y} r="1.4" fill="#7ba05b" opacity="0.85" />
              )}
              <title>{m.name}</title>
            </g>
          ))}
        </svg>
        <span className="absolute bottom-2 right-3 text-[10px] text-muted">
          약도 모드 · 카카오맵 키 등록 시 실지도 표시
        </span>
      </div>
    </div>
  );
}

export default function RouteMap(props: RouteMapProps) {
  if (KAKAO_KEY) return <KakaoRouteMap {...props} />;
  return <FallbackMap {...props} />;
}
