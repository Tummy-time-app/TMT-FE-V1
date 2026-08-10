import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCreateProduct,
  mockDeleteProduct,
  mockGetVendorProducts,
  mockUpdateProduct,
} from "@/lib/mocks/products.mock";
import type { MenuItem } from "@/features/vendors/types";

export type ProductPayload = Omit<MenuItem, "id">;

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendorProducts: builder.query<MenuItem[], string>({
      queryFn: async (vendorId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetVendorProducts(vendorId) };
          const result = await fetchWithBQ(`/vendors/${vendorId}/products`);
          if (result.error) return { error: result.error };
          return { data: result.data as MenuItem[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result, _error, vendorId) =>
        result
          ? [...result.map((p) => ({ type: "Products" as const, id: p.id })), { type: "Products" as const, id: `LIST-${vendorId}` }]
          : [{ type: "Products", id: `LIST-${vendorId}` }],
    }),

    createProduct: builder.mutation<MenuItem, { vendorId: string; payload: ProductPayload }>({
      queryFn: async ({ vendorId, payload }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateProduct(vendorId, payload) };
          const result = await fetchWithBQ({ url: `/vendors/${vendorId}/products`, method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as MenuItem };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { vendorId }) => [
        { type: "Products", id: `LIST-${vendorId}` },
        { type: "Vendors", id: vendorId },
      ],
    }),

    updateProduct: builder.mutation<MenuItem, { vendorId: string; id: number; patch: Partial<ProductPayload> }>({
      queryFn: async ({ vendorId, id, patch }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateProduct(vendorId, id, patch) };
          const result = await fetchWithBQ({ url: `/vendors/${vendorId}/products/${id}`, method: "PATCH", body: patch });
          if (result.error) return { error: result.error };
          return { data: result.data as MenuItem };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { vendorId, id }) => [
        { type: "Products", id },
        { type: "Products", id: `LIST-${vendorId}` },
        { type: "Vendors", id: vendorId },
      ],
    }),

    deleteProduct: builder.mutation<{ id: number }, { vendorId: string; id: number }>({
      queryFn: async ({ vendorId, id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockDeleteProduct(vendorId, id) };
          const result = await fetchWithBQ({ url: `/vendors/${vendorId}/products/${id}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: result.data as { id: number } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { vendorId }) => [
        { type: "Products", id: `LIST-${vendorId}` },
        { type: "Vendors", id: vendorId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVendorProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
