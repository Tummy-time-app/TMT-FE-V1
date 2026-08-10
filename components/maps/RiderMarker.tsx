"use client";

import { Bike } from "lucide-react";
import { MarkerF } from "@react-google-maps/api";
import { useMapContext } from "./MapContext";
import { useAnimatedLatLng } from "@/hooks/useAnimatedLatLng";
import type { LatLng } from "@/lib/maps/types";

/** Position updates (e.g. from a 4s poll) are smoothed via useAnimatedLatLng rather than snapping. */
export function RiderMarker({ position }: { position: LatLng }) {
  const { isGoogleMaps, projectToPercent } = useMapContext();
  const animated = useAnimatedLatLng(position) ?? position;

  if (isGoogleMaps) {
    return <MarkerF position={animated} />;
  }

  const { xPct, yPct } = projectToPercent(animated);
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-secondary text-primary-dark shadow-md">
        <Bike size={16} aria-hidden />
      </span>
    </div>
  );
}
