import type { LatLng } from "@/lib/maps/types";

/** Maps to the `addresses` table (doc §4 "Core identity") — a user's saved delivery locations. */
export interface Address {
  id: string;
  userId: string;
  /** e.g. "Home", "Office" — user-chosen, shown as the primary identifier in pickers. */
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export type CreateAddressPayload = Omit<Address, "id" | "userId" | "isDefault"> & { isDefault?: boolean };
export type UpdateAddressPayload = Partial<CreateAddressPayload> & { id: string };

/** Convenience for anything that just needs a point on the map + a one-line label. */
export function addressToLatLng(address: Address): LatLng {
  return { lat: address.lat, lng: address.lng };
}

export function formatAddressLine(address: Pick<Address, "line1" | "line2" | "city" | "state">): string {
  return [address.line1, address.line2, address.city, address.state].filter(Boolean).join(", ");
}
