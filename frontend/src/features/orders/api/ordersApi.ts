import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { CreateOrderPayload, Order } from '../types';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery,
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    myOrders: builder.query<Order[], void>({
      query: () => ({ url: '/orders/my' }),
      providesTags: [{ type: 'Orders', id: 'LIST' }],
    }),
    orderDetail: builder.query<Order, string>({
      query: (id) => ({ url: `/orders/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Orders', id }],
    }),
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      query: (payload) => ({
        url: '/orders',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),
  }),
});

export const { useMyOrdersQuery, useOrderDetailQuery, useCreateOrderMutation } = ordersApi;
