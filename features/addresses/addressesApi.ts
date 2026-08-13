import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import {
  mockCreateAddress,
  mockDeleteAddress,
  mockGetAddresses,
  mockUpdateAddress,
} from "@/lib/mocks/addresses.mock";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "./types";

/** Doc §5, UsersModule: `GET /users/me`, `PATCH /users/me`, `POST /users/me/addresses`. Addresses nest under the profile the same way there. */
export const addressesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<Address[], string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetAddresses(userId) };
          const result = await fetchWithBQ("/users/me/addresses");
          if (result.error) return { error: result.error };
          return { data: result.data as Address[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: (result) =>
        result ? [...result.map((a) => ({ type: "Addresses" as const, id: a.id })), "Addresses"] : ["Addresses"],
    }),

    createAddress: builder.mutation<Address, { userId: string; payload: CreateAddressPayload }>({
      queryFn: async ({ userId, payload }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockCreateAddress(userId, payload) };
          const result = await fetchWithBQ({ url: "/users/me/addresses", method: "POST", body: payload });
          if (result.error) return { error: result.error };
          return { data: result.data as Address };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Addresses"],
    }),

    updateAddress: builder.mutation<Address, { userId: string; payload: UpdateAddressPayload }>({
      queryFn: async ({ userId, payload }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockUpdateAddress(userId, payload) };
          const result = await fetchWithBQ({
            url: `/users/me/addresses/${payload.id}`,
            method: "PATCH",
            body: payload,
          });
          if (result.error) return { error: result.error };
          return { data: result.data as Address };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: (_result, _error, { payload }) => [{ type: "Addresses", id: payload.id }, "Addresses"],
    }),

    deleteAddress: builder.mutation<{ id: string }, { userId: string; id: string }>({
      queryFn: async ({ userId, id }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockDeleteAddress(userId, id) };
          const result = await fetchWithBQ({ url: `/users/me/addresses/${id}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: result.data as { id: string } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Addresses"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
