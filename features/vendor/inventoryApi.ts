import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockGetInventory, mockUpdateStock } from "@/lib/mocks/vendorInventory.mock";
import type { InventorySummary, UpdateStockPayload, VendorMenuItem } from "./types";

/** TMT-BE-V1's inventory routes (vendor.ts) — no fallback, same DB-outage caveat as the rest of vendor.ts. */
export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<{ summary: InventorySummary; items: VendorMenuItem[] }, string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetInventory(restaurantId) };
          const result = await fetchWithBQ(`/api/restaurants/${restaurantId}/inventory`);
          if (result.error) return { error: result.error };
          return { data: result.data as { summary: InventorySummary; items: VendorMenuItem[] } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (_result, _error, restaurantId) => [{ type: "Inventory", id: restaurantId }],
    }),

    updateStock: builder.mutation<VendorMenuItem, UpdateStockPayload>({
      queryFn: async ({ menuItemId, ...body }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateStock(menuItemId, body) };
          const result = await fetchWithBQ({ url: `/api/restaurants/menu/${menuItemId}/stock`, method: "PATCH", body });
          if (result.error) return { error: result.error };
          return { data: (result.data as { item: VendorMenuItem }).item };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      // menuItemId alone doesn't tell us which restaurant's inventory to
      // invalidate — the caller (StoreInventory.tsx) already holds
      // restaurantId, so it just refetches getInventory directly instead
      // of relying on tag invalidation here.
    }),
  }),
  overrideExisting: false,
});

export const { useGetInventoryQuery, useUpdateStockMutation } = inventoryApi;
