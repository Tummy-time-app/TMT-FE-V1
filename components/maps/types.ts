export interface LatLng {
  lat: number;
  lng: number;
}

export type MarkerKind = "vendor" | "customer" | "rider";

export interface MapMarker extends LatLng {
  id: string;
  kind: MarkerKind;
  /** Rendered in a small label under the pin, e.g. a restaurant name. */
  label?: string;
}

export interface MapProps {
  center: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  /** Polyline drawn through these points, e.g. vendor → delivery address. */
  route?: LatLng[];
  /** Mouse-wheel zoom inside the map — off by default so an embedded map doesn't trap page scroll. */
  scrollZoom?: boolean;
  /** Click-to-place a point, used by the location picker. */
  onPick?: (pos: LatLng) => void;
  className?: string;
  height?: number | string;
}
