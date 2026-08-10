import { env } from "@/config/env";
import type { LatLng, MapRegion } from "./types";

/**
 * True only when a real Google Maps key is configured. The Map component
 * never even attempts to load Google's JS without this — no key means no
 * network request and no console errors, just the mock map surface.
 */
export const hasGoogleMapsKey = Boolean(env.googleMapsApiKey);

/** Lagos Ikoyi/VI area — TummyTime's seed vendor data is scattered around here. */
export const DEFAULT_MAP_REGION: MapRegion = {
  north: 6.47,
  south: 6.42,
  west: 3.38,
  east: 3.46,
};

export const DEFAULT_MAP_CENTER: LatLng = {
  lat: (DEFAULT_MAP_REGION.north + DEFAULT_MAP_REGION.south) / 2,
  lng: (DEFAULT_MAP_REGION.east + DEFAULT_MAP_REGION.west) / 2,
};

/** Stand-in for the customer's saved delivery address until a real Addresses feature exists. */
export const MOCK_DELIVERY_LOCATION: LatLng = { lat: 6.4531, lng: 3.4356 };
