import type { UserRole } from "@/features/auth/types";

/**
 * Maps to `audit_logs` (doc §4 "Admin/audit", §10 Security: "every admin
 * action... writes to audit_logs — this should be a decorator/interceptor,
 * not manually called in every admin method"). `ipAddress` is omitted —
 * a browser-only mock has no real IP to report, and fabricating one would
 * be a lie the real backend's version of this table never would be.
 */
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  /** e.g. "vendor.approved", "user.deactivated", "banner.deleted". */
  action: string;
  targetTable: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}
