import type { FoodListing } from "@/features/food/types";
import { DUMMY_RESTAURANTS, dummyMenuItemsFor } from "./restaurants.dummy";

/**
 * FRONTEND-ONLY PLACEHOLDER DATA — see lib/dummy/restaurants.dummy.ts's
 * doc comment. Built from that same dummy restaurant/menu data rather
 * than a separate set, so a dummy dish always points at a dummy
 * restaurant consistently across the food-discovery page and the
 * restaurant listing/detail pages.
 */
export const DUMMY_FOOD_LISTINGS: FoodListing[] = DUMMY_RESTAURANTS.flatMap((restaurant) =>
  dummyMenuItemsFor(restaurant.id).map((item) => ({ item, restaurant })),
);
