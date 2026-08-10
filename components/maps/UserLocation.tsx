"use client";

import { MarkerF } from "@react-google-maps/api";
import { useMapContext } from "./MapContext";
import type { LatLng } from "@/lib/maps/types";

export function UserLocation({ position, label = "You" }: { position: LatLng; label?: string }) {
  const { isGoogleMaps, projectToPercent } = useMapContext();

  if (isGoogleMaps) {
    return <MarkerF position={position} title={label} />;
  }

  const { xPct, yPct } = projectToPercent(position);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
      <span className="relative flex h-4 w-4 items-center justify-center" aria-label={label}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-info shadow" />
      </span>
    </div>
  );
}
