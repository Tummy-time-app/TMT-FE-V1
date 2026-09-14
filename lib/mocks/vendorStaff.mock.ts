import { mockDelay } from "@/lib/dev/devMode";
import type { StaffMember } from "@/features/vendor/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Only list/remove are wired up (see StaffMember's doc comment for why
 * there's no "add" here) — so, like vendorReviews.mock.ts, this lazily
 * seeds a couple of sample staff rows per restaurantId on first read
 * (persisted to localStorage) so there's actually something to see/remove
 * in dev mode, rather than a permanently empty list.
 * ═══════════════════════════════════════════════════════════════════════
 */

const STAFF_KEY = "tummytime_mock_staff";

const SAMPLE_STAFF: { name: string; email: string; role: string }[] = [
  { name: "Amaka Obi", role: "vendor_manager", email: "amaka.obi@example.com" },
  { name: "Tunde Bello", role: "vendor_kitchen", email: "tunde.bello@example.com" },
];

function load(): Record<string, StaffMember[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STAFF_KEY) ?? "{}") as Record<string, StaffMember[]>;
  } catch {
    return {};
  }
}

function save(data: Record<string, StaffMember[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STAFF_KEY, JSON.stringify(data));
}

export async function mockGetStaff(restaurantId: string): Promise<StaffMember[]> {
  await mockDelay();
  const all = load();
  let staff = all[restaurantId];
  if (!staff) {
    staff = SAMPLE_STAFF.map((s) => ({
      id: crypto.randomUUID(),
      restaurantId,
      userId: crypto.randomUUID(),
      role: s.role,
      name: s.name,
      email: s.email,
    }));
    all[restaurantId] = staff;
    save(all);
  }
  return staff;
}

export async function mockRemoveStaff(id: string): Promise<{ message: string }> {
  await mockDelay();
  const all = load();
  for (const restaurantId of Object.keys(all)) {
    all[restaurantId] = all[restaurantId].filter((s) => s.id !== id);
  }
  save(all);
  return { message: "Staff member removed successfully" };
}
