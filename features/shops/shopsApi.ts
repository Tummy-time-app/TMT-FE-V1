import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetProducts, mockGetShop, mockListShops } from "@/lib/mocks/shops.mock";
import type { Product, Shop } from "./types";

/**
 * No shops/products section exists in TMT-BE-V1's backend doc at all
 * (unlike restaurants — see restaurantsApi.ts) — there's no real
 * endpoint path to mirror. The real-mode branches below call a plausible
 * REST shape (`/api/shops`) as a placeholder for when the backend adds
 * retail support, same "seam for later" pattern as every other feature
 * here, just with no real contract behind it yet to verify against.
 */
export const shopsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listShops: builder.query<Shop[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListShops() };
          const result = await fetchWithBQ("/api/shops");
          if (result.error) return { error: result.error };
          return { data: (result.data as { shops: Shop[] }).shops };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: [{ type: "Shops", id: "LIST" }],
    }),

    getShop: builder.query<Shop, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetShop(id) };
          const result = await fetchWithBQ(`/api/shops/${id}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { shop: Shop }).shop };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Shops", id }],
    }),

    getShopProducts: builder.query<Product[], string>({
      queryFn: async (shopId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetProducts(shopId) };
          const result = await fetchWithBQ(`/api/shops/${shopId}/products`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { products: Product[] }).products };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, shopId) => [{ type: "Products", id: shopId }],
    }),
  }),
  overrideExisting: false,
});

export const { useListShopsQuery, useGetShopQuery, useGetShopProductsQuery } = shopsApi;
