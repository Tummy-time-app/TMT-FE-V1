"use client";

import { Store } from "@/components/icons";
import { MarkerF } from "@react-google-maps/api";
import { useMapContext } from "./MapContext";
import type { LatLng } from "@/lib/maps/types";

export function VendorMarker({ position, label }: { position: LatLng; label?: string }) {
  const { isGoogleMaps, projectToPercent } = useMapContext();

  if (isGoogleMaps) {
    return <MarkerF position={position} title={label} />;
  }

  const { xPct, yPct } = projectToPercent(position);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
      <div className="flex flex-col items-center gap-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-md">
          <Store size={15} aria-hidden />
        </span>
        {label && (
          <span className="whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-text shadow-sm">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
