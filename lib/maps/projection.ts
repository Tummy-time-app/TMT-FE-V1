import type { LatLng, MapRegion } from "./types";

/**
 * Projects a lat/lng into a 0–100 percentage position within `region`, for
 * absolutely-positioning markers on the mock map surface. Not a real map
 * projection (no need for one over an area this small) — just enough to
 * place points sensibly relative to each other.
 */
export function projectToPercent(point: LatLng, region: MapRegion): { xPct: number; yPct: number } {
  const xPct = ((point.lng - region.west) / (region.east - region.west)) * 100;
  // Latitude increases northward; screen y increases downward.
  const yPct = ((region.north - point.lat) / (region.north - region.south)) * 100;

  return {
    xPct: clamp(xPct, -4, 104),
    yPct: clamp(yPct, -4, 104),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Expands a region to comfortably fit a set of points, falling back to `fallback` when empty. */
export function regionForPoints(points: LatLng[], fallback: MapRegion, paddingRatio = 0.35): MapRegion {
  if (points.length === 0) return fallback;

  let north = points[0].lat;
  let south = points[0].lat;
  let east = points[0].lng;
  let west = points[0].lng;

  for (const p of points) {
    north = Math.max(north, p.lat);
    south = Math.min(south, p.lat);
    east = Math.max(east, p.lng);
    west = Math.min(west, p.lng);
  }

  const latPad = Math.max((north - south) * paddingRatio, 0.01);
  const lngPad = Math.max((east - west) * paddingRatio, 0.01);

  return {
    north: north + latPad,
    south: south - latPad,
    east: east + lngPad,
    west: west - lngPad,
  };
}
