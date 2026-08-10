"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type ReactNode } from "react";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_REGION, hasGoogleMapsKey } from "@/lib/maps/config";
import { projectToPercent, regionForPoints } from "@/lib/maps/projection";
import type { LatLng, MapRegion } from "@/lib/maps/types";
import { MapContext } from "./MapContext";
import { MapControls } from "./MapControls";
import { cn } from "@/lib/utils/cn";

const GoogleMapView = dynamic(() => import("./GoogleMapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-[inherit] bg-black/5" />,
});

interface MapProps {
  center?: LatLng;
  zoom?: number;
  /** When set (and no explicit center override matters), the mock projection auto-fits these points. */
  fitPoints?: LatLng[];
  height?: number | string;
  className?: string;
  children?: ReactNode;
}

/**
 * Reusable map surface (spec §22). Renders real Google Maps when
 * NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is configured, otherwise a clearly
 * labeled illustrative mock — VendorMarker/UserLocation/RiderMarker/
 * DeliveryRoute work unmodified against either backend via MapContext.
 */
export function Map({ center = DEFAULT_MAP_CENTER, zoom = 14, fitPoints, height = 260, className, children }: MapProps) {
  const [mockZoom, setMockZoom] = useState(1);

  const region = useMemo<MapRegion>(
    () => (fitPoints && fitPoints.length > 0 ? regionForPoints(fitPoints, DEFAULT_MAP_REGION) : DEFAULT_MAP_REGION),
    [fitPoints]
  );

  if (hasGoogleMapsKey) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)} style={{ height }}>
        <GoogleMapView center={center} zoom={zoom} height={height}>
          {children}
        </GoogleMapView>
      </div>
    );
  }

  return (
    <MapContext.Provider
      value={{
        isGoogleMaps: false,
        region,
        zoom: mockZoom,
        projectToPercent: (point) => projectToPercent(point, region),
      }}
    >
      <div className={cn("relative overflow-hidden rounded-lg", className)} style={{ height }}>
        <div className="mock-map-grid absolute inset-0" aria-hidden />
        <div
          className="absolute inset-0 duration-normal ease-standard"
          style={{ transform: `scale(${mockZoom})`, transformOrigin: "center", transition: "transform 250ms" }}
        >
          {children}
        </div>
        <MapControls zoom={mockZoom} onZoomChange={setMockZoom} />
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-text-subtle backdrop-blur-sm">
          Preview map
        </span>
      </div>
    </MapContext.Provider>
  );
}
