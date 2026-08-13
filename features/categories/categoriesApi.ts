import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCreateCategory,
  mockDeleteCategory,
  mockGetCategories,
  mockUpdateCategory,
} from "@/lib/mocks/categories.mock";
import type { CreateCategoryPayload, ProductCategory, UpdateCategoryPayload } from "./types";

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ProductCategory[], string>({
      queryFn: async (vendorId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetCategories(vendorId) };
          const result = await fetchWithBQ(`/vendors/${vendorId}/categories`);
          if (result.error) return { error: result.error };
          return { data: result.data as ProductCategory[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Categories"],
    }),

    createCategory: builder.mutation<ProductCategory, CreateCategoryPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateCategory(payload) };
          const result = await fetchWithBQ({ url: `/vendors/${payload.vendorId}/categories`, method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as ProductCategory };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<ProductCategory, UpdateCategoryPayload>({
      queryFn: async (payload, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateCategory(payload) };
          const result = await fetchWithBQ({ url: `/categories/${payload.id}`, method: "PATCH", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as ProductCategory };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation<{ id: string }, { vendorId: string; id: string }>({
      queryFn: async ({ vendorId, id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockDeleteCategory(vendorId, id) };
          const result = await fetchWithBQ({ url: `/categories/${id}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: result.data as { id: string } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Categories"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
