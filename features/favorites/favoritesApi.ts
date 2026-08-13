import { baseApi } from "@/store/api/baseApi";
import { isDevMode } from "@/lib/dev/devMode";
import { toQueryError } from "@/lib/utils/apiError";
import { mockAddFavorite, mockGetFavorites, mockRemoveFavorite } from "@/lib/mocks/favorites.mock";
import type { Favorite } from "./types";

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<Favorite[], string>({
      queryFn: async (userId, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockGetFavorites(userId) };
          const result = await fetchWithBQ("/users/me/favorites");
          if (result.error) return { error: result.error };
          return { data: result.data as Favorite[] };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      providesTags: ["Favorites"],
    }),

    addFavorite: builder.mutation<Favorite, { userId: string; vendorId: string }>({
      queryFn: async ({ userId, vendorId }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockAddFavorite(userId, vendorId) };
          const result = await fetchWithBQ({ url: "/users/me/favorites", method: "POST", body: { vendorId } });
          if (result.error) return { error: result.error };
          return { data: result.data as Favorite };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Favorites"],
    }),

    removeFavorite: builder.mutation<{ vendorId: string }, { userId: string; vendorId: string }>({
      queryFn: async ({ userId, vendorId }, _api, _extra, fetchWithBQ) => {
        try {
          if (isDevMode) return { data: await mockRemoveFavorite(userId, vendorId) };
          const result = await fetchWithBQ({ url: `/users/me/favorites/${vendorId}`, method: "DELETE" });
          if (result.error) return { error: result.error };
          return { data: result.data as { vendorId: string } };
        } catch (error) {
          return { error: toQueryError(error) };
        }
      },
      invalidatesTags: ["Favorites"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } = favoritesApi;
