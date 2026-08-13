import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetAuditLog } from "@/lib/mocks/auditLog.mock";
import type { AuditLogEntry } from "./types";

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Admin — the full audit trail, most recent first. */
    getAuditLog: builder.query<AuditLogEntry[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAuditLog() };
          const result = await fetchWithBQ("/admin/audit-log");
          if (result.error) return { error: result.error };
          return { data: result.data as AuditLogEntry[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["AuditLog"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAuditLogQuery } = auditApi;
