import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetMenu, mockGetRestaurant, mockListRestaurants } from "@/lib/mocks/restaurants.mock";
import type { MenuItem, Restaurant } from "./types";

/**
 * TMT-BE-V1's restaurant-service (services/restaurant-service/src/routes/
 * restaurants.ts). Falls back to in-memory seed data server-side even when
 * its own DB is unreachable, so these endpoints return something useful
 * from the moment the gateway is up. Customer-facing subset only — see
 * this file's sibling comment in authApi.ts for why vendor-management
 * endpoints (promotions, settlements, inventory, categories, ...) aren't
 * ported here.
 */
export const restaurantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * `businessType` filters to one or more of restaurant-service's
     * businessTypeEnum values (comma-separated, e.g. "retail,other") — used
     * to reuse this single vendor-browsing endpoint for Groceries/Shops/
     * Markets instead of building parallel browse surfaces for each.
     */
    listRestaurants: builder.query<Restaurant[], { businessType?: string } | void>({
      queryFn: async (arg, _api, _extra, fetchWithBQ) => {
        try {
          const businessType = arg?.businessType;
          if (isDevMode) return { data: await mockListRestaurants(businessType) };
          const qs = businessType ? `?businessType=${encodeURIComponent(businessType)}` : "";
          const result = await fetchWithBQ(`/api/restaurants${qs}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { restaurants: Restaurant[] }).restaurants };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map((r) => ({ type: "Restaurants" as const, id: r.id })), { type: "Restaurants", id: "LIST" }]
          : [{ type: "Restaurants", id: "LIST" }],
    }),

    getRestaurant: builder.query<Restaurant, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetRestaurant(id) };
          const result = await fetchWithBQ(`/api/restaurants/${id}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { restaurant: Restaurant }).restaurant };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Restaurants", id }],
    }),

    getMenu: builder.query<MenuItem[], string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetMenu(restaurantId) };
          const result = await fetchWithBQ(`/api/restaurants/${restaurantId}/menu`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { menuItems: MenuItem[] }).menuItems };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, restaurantId) => [{ type: "MenuItems", id: restaurantId }],
    }),
  }),
  overrideExisting: false,
});

export const { useListRestaurantsQuery, useGetRestaurantQuery, useGetMenuQuery } = restaurantsApi;
