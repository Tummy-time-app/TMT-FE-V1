/**
 * Thin wrapper around OpenStreetMap's free public Nominatim API — no key
 * needed, matches the no-API-key map provider choice. Nominatim's usage
 * policy (https://operations.osmfoundation.org/policies/nominatim/) caps
 * the public instance at ~1 req/sec and asks for an identifying param for
 * any real production volume; callers here already debounce to well under
 * that (only fired on marker drag-end/click, not while dragging). If this
 * ever needs to scale past dev/demo traffic, swap in a self-hosted
 * Nominatim or a paid geocoder here — this is the one function to change.
 */
export interface ReverseGeocodeResult {
  line1: string;
  city: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address ?? {};
    const line1 = [addr.house_number, addr.road].filter(Boolean).join(" ") || data.display_name?.split(",")[0] || "";
    const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
    if (!line1 && !city) return null;
    return { line1, city };
  } catch {
    // Offline, rate-limited, or the endpoint is unreachable — the picker
    // falls back to leaving the address fields as the user typed them.
    return null;
  }
}
