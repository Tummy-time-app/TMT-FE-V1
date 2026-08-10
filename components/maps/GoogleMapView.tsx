"use client";

import type { ReactNode } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { env } from "@/config/env";
import { DEFAULT_MAP_REGION } from "@/lib/maps/config";
import { projectToPercent } from "@/lib/maps/projection";
import type { LatLng } from "@/lib/maps/types";
import { MapContext } from "./MapContext";

/**
 * Real Google Maps rendering path — only ever mounted (by <Map>) when
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set, so useJsApiLoader never fires
 * a request without a key. Built against @react-google-maps/api's stable
 * documented API; not yet exercised against a live key in this repo.
 */

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  clickableIcons: false,
  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
};

interface GoogleMapViewProps {
  center: LatLng;
  zoom: number;
  height: number | string;
  children?: ReactNode;
}

export default function GoogleMapView({ center, zoom, height, children }: GoogleMapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "tummytime-google-maps",
    googleMapsApiKey: env.googleMapsApiKey,
  });

  const containerStyle = { width: "100%", height: typeof height === "number" ? `${height}px` : height, borderRadius: "inherit" };

  if (loadError) {
    return (
      <div style={containerStyle} className="flex items-center justify-center bg-black/5 text-small text-text-muted">
        Map failed to load.
      </div>
    );
  }

  if (!isLoaded) {
    return <div style={containerStyle} className="animate-pulse bg-black/5" />;
  }

  return (
    <MapContext.Provider
      value={{
        isGoogleMaps: true,
        region: DEFAULT_MAP_REGION,
        zoom,
        projectToPercent: (point) => projectToPercent(point, DEFAULT_MAP_REGION),
      }}
    >
      <GoogleMap center={center} zoom={zoom} options={MAP_OPTIONS} mapContainerStyle={containerStyle}>
        {children}
      </GoogleMap>
    </MapContext.Provider>
  );
}
