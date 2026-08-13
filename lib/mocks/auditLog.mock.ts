import { mockDelay } from "@/lib/dev/devMode";
import type { AuditLogEntry } from "@/features/audit/types";

/**
 * DEVELOPMENT MOCK — see lib/mocks/auth.mock.ts for the pattern.
 *
 * `writeAuditLogInternal` is called from `features/audit/logAdminAction.ts`
 * via each admin-mutation endpoint's `onQueryStarted` — the business-logic
 * mock functions themselves (mockSetVendorApprovalStatus, etc.) never call
 * this directly, matching the doc's "decorator/interceptor, not manually
 * called in every admin method" guidance at the API-slice layer instead of
 * inside each mock.
 */

const AUDIT_LOG_STORAGE_KEY = "tummytime_mock_audit_log";
const MAX_ENTRIES = 500;

function loadEntries(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY) ?? "[]") as AuditLogEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: AuditLogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function writeAuditLogInternal(entry: Omit<AuditLogEntry, "id" | "createdAt">): void {
  const full: AuditLogEntry = { ...entry, id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() };
  saveEntries([full, ...loadEntries()]);
}

export async function mockGetAuditLog(): Promise<AuditLogEntry[]> {
  await mockDelay(400);
  return loadEntries();
}
