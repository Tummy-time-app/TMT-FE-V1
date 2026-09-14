import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetEarningsSummary, mockGetSettlements } from "@/lib/mocks/vendorEarnings.mock";
import type { EarningsSummary, Settlement } from "./types";

/**
 * TMT-BE-V1's restaurant-service vendor.ts earnings/settlements routes.
 * No mutations exist on the backend for this domain — read-only.
 */
export const earningsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEarningsSummary: builder.query<EarningsSummary, string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetEarningsSummary(restaurantId) };
          const result = await fetchWithBQ(`/api/restaurants/${restaurantId}/earnings`);
          if (result.error) return { error: result.error };
          return { data: result.data as EarningsSummary };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, restaurantId) => [{ type: "Settlements", id: `summary-${restaurantId}` }],
    }),

    getSettlements: builder.query<Settlement[], string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetSettlements(restaurantId) };
          const result = await fetchWithBQ(`/api/restaurants/${restaurantId}/settlements`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { settlements: Settlement[] }).settlements };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result, _error, restaurantId) =>
        result
          ? [...result.map((s) => ({ type: "Settlements" as const, id: s.id })), { type: "Settlements", id: restaurantId }]
          : [{ type: "Settlements", id: restaurantId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetEarningsSummaryQuery, useGetSettlementsQuery } = earningsApi;
