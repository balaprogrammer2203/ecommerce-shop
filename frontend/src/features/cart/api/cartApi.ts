import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { Cart, CartItem } from '../types';

type BackendCartItem = {
  product: unknown;
  name: string;
  qty: number;
  price: number;
  image?: string;
};

type BackendCart = {
  items: BackendCartItem[];
  itemsPrice: number;
  totalPrice: number;
};

const toProductId = (product: unknown): string => {
  if (!product) return '';
  if (typeof product === 'string') return product;
  if (typeof product !== 'object') return '';

  const obj = product as { _id?: unknown; id?: unknown };

  if (obj._id !== undefined && obj._id !== null) {
    if (typeof obj._id === 'string' || typeof obj._id === 'number') return String(obj._id);
    if (
      typeof obj._id === 'object' &&
      typeof (obj._id as { toString?: () => string }).toString === 'function'
    ) {
      return (obj._id as { toString: () => string }).toString();
    }
  }

  if (obj.id !== undefined && obj.id !== null) {
    if (typeof obj.id === 'string' || typeof obj.id === 'number') return String(obj.id);
    if (
      typeof obj.id === 'object' &&
      typeof (obj.id as { toString?: () => string }).toString === 'function'
    ) {
      return (obj.id as { toString: () => string }).toString();
    }
  }

  return '';
};

const toCartItem = (item: BackendCartItem): CartItem => ({
  id: toProductId(item.product),
  name: item.name,
  price: item.price,
  quantity: item.qty,
  image: item.image,
});

const toCart = (cart: BackendCart): Cart => ({
  items: (cart.items || []).map(toCartItem).filter((it) => it.id),
  itemsPrice: cart.itemsPrice ?? 0,
  totalPrice: cart.totalPrice ?? cart.itemsPrice ?? 0,
});

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery,
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    myCart: builder.query<Cart, void>({
      query: () => ({ url: '/cart' }),
      providesTags: [{ type: 'Cart', id: 'LIST' }],
      transformResponse: (response: BackendCart) => toCart(response),
    }),
    addItemToCart: builder.mutation<Cart, { productId: string; qty: number }>({
      query: (payload) => ({
        url: '/cart/items',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
      transformResponse: (response: BackendCart) => toCart(response),
    }),
    updateCartItemQty: builder.mutation<Cart, { productId: string; qty: number }>({
      query: ({ productId, qty }) => ({
        url: `/cart/items/${productId}`,
        method: 'PUT',
        body: { qty },
      }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
      transformResponse: (response: BackendCart) => toCart(response),
    }),
    removeCartItem: builder.mutation<Cart, { productId: string }>({
      query: ({ productId }) => ({
        url: `/cart/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
      transformResponse: (response: BackendCart) => toCart(response),
    }),
    clearCart: builder.mutation<Cart, void>({
      query: () => ({
        url: '/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
      transformResponse: (response: BackendCart) => toCart(response),
    }),
  }),
});

export const {
  useMyCartQuery,
  useAddItemToCartMutation,
  useUpdateCartItemQtyMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
