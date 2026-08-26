"use client";

import "leaflet/dist/leaflet.css";
import "./maps.css";
import { useEffect, useRef } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { markerIcon } from "./icons";
import type { MapProps } from "./types";

/**
 * The real react-leaflet tree — only ever reached through Map.tsx's
 * next/dynamic(..., { ssr: false }) wrapper. Leaflet touches `window` at
 * import time, so importing this file directly from a server-rendered
 * component would break the build; Map.tsx is the one safe public entry
 * point into components/maps/.
 */

function ClickHandler({ onPick }: { onPick?: (pos: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Pans to `center` whenever it meaningfully changes — not on every render, so panning/zooming by hand isn't fought. */
function Recenter({ center, zoom }: { center: { lat: number; lng: number }; zoom?: number }) {
  const map = useMap();
  const last = useRef(center);
  useEffect(() => {
    if (last.current.lat === center.lat && last.current.lng === center.lng) return;
    last.current = center;
    map.flyTo([center.lat, center.lng], zoom ?? map.getZoom());
  }, [center, zoom, map]);
  return null;
}

/** With 2+ points to show (e.g. vendor + delivery address), frame all of them instead of trusting a single `center`/`zoom`. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length < 2) return;
    map.fitBounds(points, { padding: [32, 32], maxZoom: 16 });
    // Refit only when the actual point set changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

/** Sizing (`height`/`className`) is Map.tsx's job — this always fills its parent. */
export function LeafletMap({ center, zoom = 14, markers = [], route, scrollZoom = false, onPick }: MapProps) {
  const boundsPoints: [number, number][] = [
    ...markers.map((m): [number, number] => [m.lat, m.lng]),
    ...(route ?? []).map((p): [number, number] => [p.lat, p.lng]),
  ];

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={scrollZoom}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {route && route.length > 1 && (
        <Polyline
          positions={route.map((p) => [p.lat, p.lng]) as [number, number][]}
          pathOptions={{ color: "#ac0000", weight: 3, dashArray: "6 8", opacity: 0.7 }}
        />
      )}

      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={markerIcon(m.kind)} />
      ))}

      <ClickHandler onPick={onPick} />
      {boundsPoints.length >= 2 ? (
        <FitBounds points={boundsPoints} />
      ) : (
        <Recenter center={center} zoom={zoom} />
      )}
    </MapContainer>
  );
}
