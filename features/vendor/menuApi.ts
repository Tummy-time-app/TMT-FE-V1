import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCreateCategory,
  mockCreateExtra,
  mockCreateMenuItem,
  mockCreateVariant,
  mockGetCategories,
} from "@/lib/mocks/vendorMenu.mock";
import type { MenuItem } from "@/features/restaurants/types";
import type {
  Category,
  CreateCategoryPayload,
  CreateExtraPayload,
  CreateMenuItemPayload,
  CreateVariantPayload,
  ProductExtra,
  ProductVariant,
} from "./types";

/**
 * TMT-BE-V1's menu management: categories + menu items live on
 * restaurant-service (categories on vendor.ts, menu items on the
 * customer-facing restaurants.ts — same POST /:id/menu the fallback
 * array covers, so item creation keeps working even with the DB down;
 * categories/variants/extras are on vendor.ts, which has no fallback —
 * see the "Backend bug found" note from this session.
 *
 * No GET endpoint exists for variants/extras on the real backend — only
 * create. So there's no listVariants/listExtras hook here; the UI shows
 * them as session-local state as they're added, which is honestly all
 * the real backend supports today.
 */
export const menuApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], string>({
      queryFn: async (restaurantId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetCategories(restaurantId) };
          const result = await fetchWithBQ(`/api/restaurants/${restaurantId}/categories`);
          if (result.error) return { error: result.error };
          return { data: (result.data as { categories: Category[] }).categories };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result, _error, restaurantId) =>
        result
          ? [...result.map((c) => ({ type: "Categories" as const, id: c.id })), { type: "Categories", id: restaurantId }]
          : [{ type: "Categories", id: restaurantId }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateCategory(payload) };
          const result = await fetchWithBQ({
            url: `/api/restaurants/${payload.restaurantId}/categories`,
            method: "POST",
            body: { name: payload.name, displayOrder: payload.displayOrder },
          });
          if (result.error) return { error: result.error };
          return { data: (result.data as { category: Category }).category };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, payload) => [{ type: "Categories", id: payload.restaurantId }],
    }),

    createMenuItem: builder.mutation<MenuItem, CreateMenuItemPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateMenuItem(payload) };
          const { restaurantId, ...body } = payload;
          const result = await fetchWithBQ({ url: `/api/restaurants/${restaurantId}/menu`, method: "POST", body });
          if (result.error) return { error: result.error };
          return { data: (result.data as { menuItem: MenuItem }).menuItem };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, payload) => [
        { type: "MenuItems", id: payload.restaurantId },
      ],
    }),

    createVariant: builder.mutation<ProductVariant, CreateVariantPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateVariant(payload) };
          const { menuItemId, ...body } = payload;
          const result = await fetchWithBQ({ url: `/api/restaurants/menu/${menuItemId}/variants`, method: "POST", body });
          if (result.error) return { error: result.error };
          return { data: (result.data as { variant: ProductVariant }).variant };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),

    createExtra: builder.mutation<ProductExtra, CreateExtraPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateExtra(payload) };
          const { menuItemId, ...body } = payload;
          const result = await fetchWithBQ({ url: `/api/restaurants/menu/${menuItemId}/extras`, method: "POST", body });
          if (result.error) return { error: result.error };
          return { data: (result.data as { extra: ProductExtra }).extra };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useCreateMenuItemMutation,
  useCreateVariantMutation,
  useCreateExtraMutation,
} = menuApi;
