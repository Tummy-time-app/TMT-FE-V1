import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetRiderEarningsSummary, mockGetRiderEarningsHistory } from "@/lib/mocks/riderEarnings.mock";
import type { RiderEarningEntry, RiderEarningsSummary } from "./types";

/** TMT-BE-V1's rewards-service riderEarnings.ts (mounted at /api/rider/earnings). Read-only — no mutations on the backend for this domain. */
export const riderEarningsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRiderEarningsSummary: builder.query<RiderEarningsSummary, string>({
      queryFn: async (riderId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetRiderEarningsSummary(riderId) };
          const result = await fetchWithBQ(`/api/rider/earnings/summary?riderId=${riderId}`);
          if (result.error) return { error: result.error };
          return { data: result.data as RiderEarningsSummary };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["RiderEarnings"],
    }),

    getRiderEarningsHistory: builder.query<RiderEarningEntry[], string>({
      queryFn: async (riderId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetRiderEarningsHistory(riderId) };
          const result = await fetchWithBQ(`/api/rider/earnings/history?riderId=${riderId}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { history: RiderEarningEntry[] }).history };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["RiderEarnings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetRiderEarningsSummaryQuery, useGetRiderEarningsHistoryQuery } = riderEarningsApi;
