/** Maps to the `rider_profiles` table (doc §4 "Riders"). Document fields stay filename-only — same stand-in pattern as support ticket attachments (§7's real Storage-bucket upload flow needs live infra this sandbox doesn't have). */
export type VerificationStatus = "pending" | "approved" | "rejected";

export interface RiderProfile {
  userId: string;
  vehicleType: "bike" | "bicycle" | "car";
  licenseNumber: string;
  idDocumentName: string | null;
  vehicleDocName: string | null;
  verificationStatus: VerificationStatus;
}

export interface UpdateRiderProfilePayload {
  vehicleType?: "bike" | "bicycle" | "car";
  licenseNumber?: string;
}
