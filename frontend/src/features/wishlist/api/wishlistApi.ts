import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';

export type WishlistResponse = {
  productIds: string[];
};

export const wishlistApi = createApi({
  reducerPath: 'wishlistApi',
  baseQuery,
  tagTypes: ['Wishlist'],
  endpoints: (builder) => ({
    getWishlist: builder.query<WishlistResponse, void>({
      query: () => ({ url: '/wishlist' }),
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<WishlistResponse, string>({
      query: (productId) => ({
        url: '/wishlist/items',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<WishlistResponse, string>({
      query: (productId) => ({
        url: `/wishlist/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),
    mergeWishlist: builder.mutation<WishlistResponse, { productIds: string[] }>({
      query: (body) => ({
        url: '/wishlist/merge',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wishlist'],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useMergeWishlistMutation,
} = wishlistApi;
