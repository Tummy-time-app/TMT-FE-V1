import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCreateStore,
  mockGetMyStores,
  mockToggleStoreOpen,
  mockUpdateStoreProfile,
  mockUpdateStoreStatus,
} from "@/lib/mocks/vendor.mock";
import type {
  CreateStorePayload,
  StoreStatus,
  UpdateStoreProfilePayload,
  VendorRestaurant,
} from "./types";

/**
 * TMT-BE-V1's restaurant-service vendor.ts + the create/toggle-open routes
 * on restaurants.ts (services/restaurant-service/src/routes/{vendor,
 * restaurants}.ts) — the "foundation" slice: identity + store setup.
 * Menu/inventory/promotions/order-workflow/financials/reviews are
 * separate, later phases.
 *
 * Shares the "Restaurants" tag with restaurantsApi.ts's customer-facing
 * reads (so a vendor's edit invalidates what customers see too), plus its
 * own "VendorStores" tag for the vendor's own "my stores" view.
 */
export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyStores: builder.query<VendorRestaurant[], string>({
      queryFn: async (ownerId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetMyStores(ownerId) };
          const result = await fetchWithBQ(`/api/restaurants/vendor/owner/${ownerId}`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { stores: VendorRestaurant[] }).stores };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [...result.map((s) => ({ type: "VendorStores" as const, id: s.id })), { type: "VendorStores", id: "LIST" }]
          : [{ type: "VendorStores", id: "LIST" }],
    }),

    createStore: builder.mutation<VendorRestaurant, CreateStorePayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateStore(payload) };
          const result = await fetchWithBQ({ url: "/api/restaurants", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: (result.data as { restaurant: VendorRestaurant }).restaurant };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: [{ type: "VendorStores", id: "LIST" }, { type: "Restaurants", id: "LIST" }],
    }),

    updateStoreProfile: builder.mutation<VendorRestaurant, UpdateStoreProfilePayload>({
      queryFn: async ({ id, patch }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateStoreProfile({ id, patch }) };
          const result = await fetchWithBQ({ url: `/api/restaurants/${id}/profile`, method: "PUT", body: patch });
          if (result.error) return { error: result.error };
          return { data: (result.data as { store: VendorRestaurant }).store };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "VendorStores", id },
        { type: "Restaurants", id },
        { type: "Restaurants", id: "LIST" },
      ],
    }),

    /** The 3-way status (also covers TEMPORARILY_CLOSED) — prefer this over toggleStoreOpen for a real settings UI. */
    updateStoreStatus: builder.mutation<{ storeStatus: StoreStatus; isOpen: boolean }, { id: string; storeStatus: StoreStatus }>({
      queryFn: async ({ id, storeStatus }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateStoreStatus(id, storeStatus) };
          const result = await fetchWithBQ({ url: `/api/restaurants/${id}/status`, method: "PUT", body: { storeStatus } });
          if (result.error) return { error: result.error };
          return { data: result.data as { storeStatus: StoreStatus; isOpen: boolean } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "VendorStores", id },
        { type: "Restaurants", id },
        { type: "Restaurants", id: "LIST" },
      ],
    }),

    /** A simpler binary open/closed flip — no TEMPORARILY_CLOSED distinction. Handy for a one-tap toggle switch. */
    toggleStoreOpen: builder.mutation<VendorRestaurant, string>({
      queryFn: async (id, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockToggleStoreOpen(id) };
          const result = await fetchWithBQ({ url: `/api/restaurants/${id}/toggle-open`, method: "PATCH" });
          if (result.error) return { error: result.error };
          return { data: (result.data as { restaurant: VendorRestaurant }).restaurant };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: "VendorStores", id },
        { type: "Restaurants", id },
        { type: "Restaurants", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreProfileMutation,
  useUpdateStoreStatusMutation,
  useToggleStoreOpenMutation,
} = vendorApi;
