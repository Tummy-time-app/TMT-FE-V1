import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockListAllOrders, mockOverrideOrderStatus } from "@/lib/mocks/adminOrders.mock";
import type { Order, OrderStatus } from "@/features/orders/types";
import type { Paginated } from "./types";

/**
 * TMT-BE-V1's order-service adminOrders.ts (mounted at /api/admin/orders).
 * Shares the "Orders" tag with ordersApi.ts/vendorOrdersApi.ts/
 * riderOrdersApi.ts — an admin override touches the same order row every
 * other view reads, same reasoning as those slices' doc comments.
 */
export const adminOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAllOrders: builder.query<Paginated<Order>, { page: number; limit: number; status?: OrderStatus }>({
      queryFn: async ({ page, limit, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockListAllOrders(page, limit, status) };
          const params = new URLSearchParams({ page: String(page), limit: String(limit) });
          if (status) params.set("status", status);
          const result = await fetchWithBQ(`/api/admin/orders?${params.toString()}`);
          if (result.error) return { error: result.error };
          return { data: result.data as Paginated<Order> };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.data.map((o) => ({ type: "Orders" as const, id: o.id })), { type: "Orders", id: "admin-LIST" }] : [{ type: "Orders", id: "admin-LIST" }],
    }),

    overrideOrderStatus: builder.mutation<Order, { id: string; status: OrderStatus }>({
      queryFn: async ({ id, status }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockOverrideOrderStatus(id, status) };
          const result = await fetchWithBQ({ url: `/api/admin/orders/${id}/override-status`, method: "PATCH", body: { status } });
          if (result.error) return { error: result.error };
          return { data: (result.data as { order: Order }).order };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "Orders", id }, { type: "Orders", id: "admin-LIST" }, { type: "Orders", id: "LIST" }, "Notifications"],
    }),
  }),
  overrideExisting: false,
});

export const { useListAllOrdersQuery, useOverrideOrderStatusMutation } = adminOrdersApi;
