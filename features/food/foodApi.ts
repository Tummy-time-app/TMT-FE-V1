import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetMenu, mockListRestaurants } from "@/lib/mocks/restaurants.mock";
import type { MenuItem, Restaurant } from "@/features/restaurants/types";
import type { FoodListing } from "./types";

/**
 * TMT-BE-V1 has no aggregate "every dish across every restaurant"
 * endpoint (restaurant-service's contract is restaurant-scoped, see
 * restaurantsApi.ts) — food discovery needs exactly that, so this
 * composes it: list restaurants, then fetch each one's menu, then flatten.
 * Same real/mock branch as every other endpoint (isDevMode), just
 * fanning out to N menu calls instead of one. Bounded to
 * MAX_RESTAURANTS_FOR_DISCOVERY so this hook can't turn into an
 * unbounded N+1 against a real gateway — generous enough for a
 * discovery page, not a full catalog crawl.
 */
const MAX_RESTAURANTS_FOR_DISCOVERY = 12;

export const foodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    discoverFood: builder.query<FoodListing[], void>({
      queryFn: async (_arg, _api, _extra, fetchWithBQ) => {
        try {
          let restaurants: Restaurant[];
          if (isDevMode) {
            restaurants = await mockListRestaurants();
          } else {
            const result = await fetchWithBQ("/api/restaurants");
            if (result.error) return { error: result.error };
            restaurants = (result.data as { restaurants: Restaurant[] }).restaurants;
          }

          const pool = restaurants.slice(0, MAX_RESTAURANTS_FOR_DISCOVERY);
          const perRestaurant = await Promise.all(
            pool.map(async (restaurant): Promise<FoodListing[]> => {
              let items: MenuItem[];
              if (isDevMode) {
                items = await mockGetMenu(restaurant.id);
              } else {
                const result = await fetchWithBQ(`/api/restaurants/${restaurant.id}/menu`);
                // A single restaurant's menu failing to load shouldn't sink
                // the whole discovery feed — it just contributes nothing.
                items = result.error ? [] : (result.data as { menuItems: MenuItem[] }).menuItems;
              }
              return items.map((item) => ({ item, restaurant }));
            }),
          );

          return { data: perRestaurant.flat() };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: [{ type: "Restaurants", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const { useDiscoverFoodQuery } = foodApi;
