import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { MegaMenuResponse, Product, ProductListResponse } from '../types';

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery,
  tagTypes: ['Product', 'MegaMenu'],
  endpoints: (builder) => ({
    megaMenu: builder.query<MegaMenuResponse, void>({
      query: () => ({ url: '/categories/mega-menu' }),
      providesTags: [{ type: 'MegaMenu', id: 'HEADER' }],
    }),
    listProducts: builder.query<
      ProductListResponse,
      {
        keyword?: string;
        page?: number;
        limit?: number;
        categoryId?: string;
        categorySlug?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        brand?: string;
        /** JSON string, e.g. '{"ram":"8GB"}' */
        attrs?: string;
      }
    >({
      query: ({
        keyword,
        page,
        limit,
        categoryId,
        categorySlug,
        category,
        minPrice,
        maxPrice,
        brand,
        attrs,
      }) => ({
        url: '/products',
        params: {
          keyword,
          page,
          limit,
          categoryId,
          categorySlug,
          category,
          minPrice,
          maxPrice,
          brand,
          attrs,
        },
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

export const { useMegaMenuQuery, useListProductsQuery, useProductDetailQuery } = catalogApi;
