import { mockDelay } from "@/lib/dev/devMode";
import { loadAllRiderProfiles, mockSetRiderVerification } from "./riderProfile.mock";
import { listAllUsersSanitized } from "./auth.mock";
import type { AdminRider, Paginated } from "@/features/admin/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Joins riderProfile.mock.ts's store with auth.mock.ts's users, mirroring
 * adminRoutes.ts's real GET /riders (which does the equivalent SQL join —
 * the bare riderProfiles row has no name/email on its own).
 * ═══════════════════════════════════════════════════════════════════════
 */
export async function mockListRiders(page: number, limit: number): Promise<Paginated<AdminRider>> {
  await mockDelay();
  const users = listAllUsersSanitized();
  const joined: AdminRider[] = loadAllRiderProfiles().map((profile) => {
    const user = users.find((u) => u.id === profile.userId);
    return {
      id: profile.id,
      userId: profile.userId,
      name: user?.name ?? "Unknown rider",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      vehicleType: profile.vehicleType,
      plateNumber: profile.plateNumber,
      verificationStatus: profile.verificationStatus,
      isOnline: profile.isOnline,
      rating: profile.rating,
    };
  });
  const start = (page - 1) * limit;
  const data = joined.slice(start, start + limit);
  return { data, pagination: { page, limit, total: joined.length, totalPages: Math.max(1, Math.ceil(joined.length / limit)) } };
}

export async function mockVerifyRider(userId: string, status: "verified" | "rejected"): Promise<void> {
  await mockSetRiderVerification(userId, status);
}
