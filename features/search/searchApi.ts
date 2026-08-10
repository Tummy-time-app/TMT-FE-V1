import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockSearchVendors } from "@/lib/mocks/search.mock";
import type { Vendor } from "@/features/vendors/types";

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<Vendor[], string>({
      queryFn: async (q, _api, _extra, fetchWithBQ) => {
        try {
          if (!q.trim()) return { data: [] };
          if (isDevMode) return { data: await mockSearchVendors(q) };
          const result = await fetchWithBQ({ url: "/search", params: { q } });
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
