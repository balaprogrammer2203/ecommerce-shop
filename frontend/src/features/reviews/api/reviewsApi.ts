import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { ProductReviewsResponse, Review } from '../types';

export type CreateReviewPayload = {
  rating: number;
  title?: string;
  comment?: string;
};

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery,
  tagTypes: ['Reviews'],
  endpoints: (builder) => ({
    productReviews: builder.query<
      ProductReviewsResponse,
      { productId: string; page?: number; limit?: number }
    >({
      query: ({ productId, page, limit }) => ({
        url: `/reviews/products/${productId}`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Reviews', id: arg.productId }],
      transformResponse: (response: ProductReviewsResponse) => response,
    }),
    submitReview: builder.mutation<Review, { productId: string; payload: CreateReviewPayload }>({
      query: ({ productId, payload }) => ({
        url: `/reviews/products/${productId}`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Reviews', id: arg.productId }],
    }),
  }),
});

export const { useProductReviewsQuery, useSubmitReviewMutation } = reviewsApi;
