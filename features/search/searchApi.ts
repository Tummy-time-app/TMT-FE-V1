import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockSearchVendors } from "@/lib/mocks/search.mock";
import type { Vendor } from "@/features/vendors/types";

/** Doc §5, SearchModule: `GET /search?q=&lat=&lng=&cuisine=&maxDeliveryTime=`. */
export interface SearchParams {
  q: string;
  lat?: number;
  lng?: number;
  cuisine?: string;
  maxDeliveryTime?: number;
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<Vendor[], SearchParams>({
      queryFn: async (params, _api, _extra, fetchWithBQ) => {
        try {
          if (!params.q.trim()) return { data: [] };
          if (isDevMode) return { data: await mockSearchVendors(params.q) };
          const result = await fetchWithBQ({ url: "/search", params });
          if (result.error) return { error: result.error };
          return { data: result.data as Vendor[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Vendors"],
    }),
  }),
  overrideExisting: false,
});

export const { useSearchQuery } = searchApi;
