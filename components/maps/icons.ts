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

/**
 * Raw SVG markup (not JSX — Leaflet's divIcon takes an HTML string) for
 * the same icons as components/icons.tsx's StoreIcon/MapPinIcon (24×24,
 * hand-drawn) and DeliveryIcon (14×14, Streamline-sourced) — kept as
 * literal path data here rather than importing those React components,
 * since this module has to stay renderable outside React (see Map.tsx's
 * dynamic-import boundary).
 */
const GLYPH: Record<MarkerKind, string> = {
  vendor:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M3 9.5 4.5 3h15L21 9.5"/><path d="M3 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 3-.2"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  customer:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  rider:
    '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" width="16" height="16"><path stroke-linejoin="round" d="M10.499 13.5a1.501 1.501 0 1 1 0-3.002a1.501 1.501 0 0 1 0 3.002m-7 0a1.501 1.501 0 1 1 0-3.002a1.501 1.501 0 0 1 0 3.002"/><path stroke-linejoin="round" d="M2 12H.5v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5A1.5 1.5 0 0 0 8 12h1m3 0h.5c.552 0 1.012-.452.908-.994C13.077 9.278 11.866 8 10 8h-.5"/><path stroke-linejoin="round" d="M8 3.5h1.5v7.379"/><path stroke-linejoin="round" d="M11.5 4.5h-1a1 1 0 0 0 0 2h1z"/><path d="M1.5 8H4a1 1 0 0 0 1-1V4.5a1 1 0 0 0-1-1H1.5a1 1 0 0 0-1 1V7a1 1 0 0 0 1 1Z"/></svg>',
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
