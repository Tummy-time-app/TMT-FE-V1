"use client";

import { PolylineF } from "@react-google-maps/api";
import { useMapContext } from "./MapContext";
import type { LatLng } from "@/lib/maps/types";

export function DeliveryRoute({ path }: { path: LatLng[] }) {
  const { isGoogleMaps, projectToPercent } = useMapContext();

  if (path.length < 2) return null;

  if (isGoogleMaps) {
    return <PolylineF path={path} options={{ strokeColor: "#AC0000", strokeOpacity: 0.8, strokeWeight: 3 }} />;
  }

  const points = path.map((p) => projectToPercent(p));
  const svgPoints = points.map((p) => `${p.xPct},${p.yPct}`).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
      <polyline
        points={svgPoints}
        fill="none"
        stroke="var(--crimson)"
        strokeWidth={1.2}
        strokeDasharray="2.5 2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
