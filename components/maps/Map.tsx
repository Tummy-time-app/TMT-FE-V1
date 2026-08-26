"use client";

import dynamic from "next/dynamic";
import type { MapProps } from "./types";

/**
 * Public entry point into components/maps/. Leaflet touches `window` at
 * import time, which breaks Next's server render even inside a "use
 * client" component (still prerendered on the server first) — so the
 * actual react-leaflet tree (LeafletMap.tsx) only ever loads client-side.
 */
const LeafletMap = dynamic(() => import("./LeafletMap").then((m) => m.LeafletMap), {
  ssr: false,
  // next/dynamic's `loading` render doesn't receive the wrapped component's
  // props, so it can't know `height` — reserve the space here in Map.tsx
  // instead, where props are in scope, and let the skeleton fill it.
  loading: () => <div className="tmt-map-skeleton" style={{ position: "absolute", inset: 0 }}>Loading map…</div>,
});

export function Map(props: MapProps) {
  return (
    <div className={`tmt-map ${props.className ?? ""}`} style={{ height: props.height ?? 240, position: "relative" }}>
      <LeafletMap {...props} />
    </div>
  );
}

export type { LatLng, MapMarker, MapProps, MarkerKind } from "./types";
