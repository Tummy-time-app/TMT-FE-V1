"use client";

import { createContext, useContext } from "react";
import type { LatLng, MapRegion } from "@/lib/maps/types";

interface MapContextValue {
  isGoogleMaps: boolean;
  region: MapRegion;
  zoom: number;
  projectToPercent: (point: LatLng) => { xPct: number; yPct: number };
}

export const MapContext = createContext<MapContextValue | null>(null);

/** Marker/route components read this to know how to render themselves — never used outside <Map>. */
export function useMapContext() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("Map child components must be rendered inside <Map>");
  return ctx;
}
