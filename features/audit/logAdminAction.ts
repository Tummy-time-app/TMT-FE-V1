import { isDevMode } from "@/lib/dev/devMode";
import { writeAuditLogInternal } from "@/lib/mocks/auditLog.mock";
import type { RootState } from "@/store";

/**
 * Called from admin-mutation endpoints' `onQueryStarted` — see
 * features/audit/types.ts's doc comment for why it lives here rather than
 * inside each mock's business logic. Real mode doesn't call this at all:
 * the backend's own decorator/interceptor writes the row server-side,
 * where `req.user` and the real IP are actually available (see doc §10).
 */
export function logAdminAction(
  getState: () => unknown,
  action: string,
  targetTable: string,
  targetId: string,
  before?: unknown,
  after?: unknown
): void {
  if (!isDevMode) return;
  const state = getState() as RootState;
  const user = state.auth.user;
  if (!user) return;
  writeAuditLogInternal({ actorId: user.id, actorName: user.name, actorRole: user.role, action, targetTable, targetId, before, after });
}
