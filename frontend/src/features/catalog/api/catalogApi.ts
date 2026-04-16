import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { HomeProductsResponse, MegaMenuResponse, Product, ProductListResponse } from '../types';

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery,
  tagTypes: ['Product', 'MegaMenu'],
  endpoints: (builder) => ({
    megaMenu: builder.query<MegaMenuResponse, void>({
      query: () => ({ url: '/categories/mega-menu' }),
      providesTags: [{ type: 'MegaMenu', id: 'HEADER' }],
    }),
    homeProducts: builder.query<
      HomeProductsResponse,
      { featuredLimit?: number; trendingLimit?: number } | void
    >({
      query: (params) => ({
        url: '/products/home',
        params: {
          featuredLimit: params?.featuredLimit,
          trendingLimit: params?.trendingLimit,
        },
      }),
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    listProducts: builder.query<
      ProductListResponse,
      {
        keyword?: string;
        page?: number;
        limit?: number;
        sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
        categoryId?: string;
        categorySlug?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        brand?: string;
        featured?: boolean;
        trending?: boolean;
        /** JSON string, e.g. '{"ram":"8GB"}' */
        attrs?: string;
      }
    >({
      query: ({
        keyword,
        page,
        limit,
        sort,
        categoryId,
        categorySlug,
        category,
        minPrice,
        maxPrice,
        brand,
        featured,
        trending,
        attrs,
      }) => ({
        url: '/products',
        params: {
          keyword,
          page,
          limit,
          sort,
          categoryId,
          categorySlug,
          category,
          minPrice,
          maxPrice,
          brand,
          featured,
          trending,
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

export const {
  useMegaMenuQuery,
  useHomeProductsQuery,
  useListProductsQuery,
  useLazyListProductsQuery,
  useProductDetailQuery,
} = catalogApi;
