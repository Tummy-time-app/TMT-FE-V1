import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetMarket, mockListMarkets } from "@/lib/mocks/markets.mock";
import type { Market } from "./types";

/** Same "no real backend surface exists yet" seam as features/shops/shopsApi.ts — see that file's doc comment. */
export const marketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMarkets: builder.query<Market[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListMarkets() };
          const result = await fetchWithBQ("/api/markets");
          if (result.error) return { error: result.error };
          return { data: (result.data as { markets: Market[] }).markets };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: [{ type: "Markets", id: "LIST" }],
    }),

    getMarket: builder.query<Market, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetMarket(id) };
          const result = await fetchWithBQ(`/api/markets/${id}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { market: Market }).market };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Markets", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useListMarketsQuery, useGetMarketQuery } = marketsApi;
