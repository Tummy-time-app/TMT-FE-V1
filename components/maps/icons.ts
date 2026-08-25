import L from "leaflet";
import type { MarkerKind } from "./types";

/**
 * Leaflet's default marker icon references image URLs
 * (marker-icon.png/marker-shadow.png) that 404 once bundled by webpack —
 * a well-known Leaflet+bundler gotcha. Sidestepping it entirely with inline
 * SVG divIcons instead, colored to the brand tokens from app/landing.css
 * (--crimson/--amber) rather than depending on that file being loaded on
 * whichever page renders a map.
 */
const COLORS: Record<MarkerKind, string> = {
  vendor: "#ac0000", // --crimson
  customer: "#1a1a1a", // --text-dark
  rider: "#ffb703", // --amber
};

const GLYPH: Record<MarkerKind, string> = {
  vendor: "🏪",
  customer: "📍",
  rider: "🛵",
};

const cache = new Map<MarkerKind, L.DivIcon>();

export function markerIcon(kind: MarkerKind): L.DivIcon {
  const cached = cache.get(kind);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "tmt-map-pin",
    html: `
      <span class="tmt-map-pin__bubble" style="background:${COLORS[kind]}">
        <span class="tmt-map-pin__glyph">${GLYPH[kind]}</span>
      </span>
      <span class="tmt-map-pin__point" style="border-top-color:${COLORS[kind]}"></span>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -40],
  });
  cache.set(kind, icon);
  return icon;
}
