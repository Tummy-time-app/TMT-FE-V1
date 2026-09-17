import { mockDelay } from "@/lib/dev/devMode";
import { listAllUsersSanitized } from "./auth.mock";
import type { AdminUser, Paginated } from "@/features/admin/types";

/**
 * ═══════════════════════════════════════════════════════════════════════
 * DEVELOPMENT MOCK — not a production code path.
 *
 * Paginates over the same seeded/registered users auth.mock.ts already
 * tracks in localStorage, mirroring adminRoutes.ts's real GET /users shape
 * (`{ data, pagination }`).
 * ═══════════════════════════════════════════════════════════════════════
 */
export async function mockListUsers(page: number, limit: number): Promise<Paginated<AdminUser>> {
  await mockDelay();
  const all = listAllUsersSanitized();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, pagination: { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) } };
}
