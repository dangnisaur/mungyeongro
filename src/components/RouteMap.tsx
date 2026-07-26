"use client";

// 지도 컴포넌트.
// 기본: Leaflet + OpenStreetMap (API 키 불필요, 실지도)
// NEXT_PUBLIC_KAKAO_MAP_KEY가 있으면 카카오맵 SDK 사용, 실패 시 Leaflet 폴백.
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMapInstance } from "leaflet";

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

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

// ── Leaflet (기본) ──────────────────────────────────────────────
function markerHtml(m: MapMarker): { html: string; size: number } {
  if (m.kind === "vet") {
    return {
      html: `<div style="width:22px;height:22px;border-radius:9999px;background:#e25555;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">+</div>`,
      size: 22,
    };
  }
  if (m.order !== undefined) {
    return {
      html: `<div style="width:26px;height:26px;border-radius:9999px;background:#ea8a3c;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${m.order}</div>`,
      size: 26,
    };
  }
  return {
    html: `<div style="width:12px;height:12px;border-radius:9999px;background:#7ba05b;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
    size: 12,
  };
}

function LeafletRouteMap({ markers, className, drawPath }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    const el = containerRef.current;
    if (!el) return;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      // 이전 인스턴스 정리 (마커 변경 시 재생성)
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(el, {
        center: [36.68, 128.12], // 문경시 중심
        zoom: 10,
        scrollWheelZoom: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      const pathPoints: Array<[number, number]> = [];

      for (const m of markers) {
        const { html, size } = markerHtml(m);
        const icon = L.divIcon({
          html,
          className: "",
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        L.marker([m.lat, m.lng], { icon, title: m.name })
          .addTo(map)
          .bindPopup(`<b>${m.name}</b>`);
        bounds.extend([m.lat, m.lng]);
        if (m.order !== undefined) pathPoints[m.order - 1] = [m.lat, m.lng];
      }

      const path = pathPoints.filter(Boolean);
      if (drawPath && path.length > 1) {
        L.polyline(path, {
          color: "#ea8a3c",
          weight: 4,
          dashArray: "8 6",
          opacity: 0.9,
        }).addTo(map);
      }

      if (markers.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], 14);
      } else if (markers.length > 1) {
        map.fitBounds(bounds, { padding: [28, 28] });
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers, drawPath]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden rounded-2xl border border-line"
      />
    </div>
  );
}

// ── 카카오맵 (키 있을 때) ───────────────────────────────────────
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

  if (failed) {
    return (
      <LeafletRouteMap markers={markers} className={className} drawPath={drawPath} />
    );
  }
  return <div ref={ref} className={className} />;
}

export default function RouteMap(props: RouteMapProps) {
  if (KAKAO_KEY) return <KakaoRouteMap {...props} />;
  return <LeafletRouteMap {...props} />;
}
