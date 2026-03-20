import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { Product, ProductListResponse } from '../types';

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery,
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    listProducts: builder.query<ProductListResponse, { keyword?: string; page?: number; limit?: number }>({
      query: ({ keyword, page, limit }) => ({
        url: '/products',
        params: { keyword, page, limit },
      }),
      providesTags: (result) =>
        result?.products
          ? [
              ...result.products.map(({ _id }) => ({ type: 'Product' as const, id: _id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    productDetail: builder.query<Product, string>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
  }),
});

export const { useListProductsQuery, useProductDetailQuery } = catalogApi;
