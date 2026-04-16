import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import {
  CreateOrderPayload,
  Order,
  PaypalCapturePayload,
  PaypalCreateOrderResponse,
  RazorpayCreateOrderResponse,
  RazorpayVerifyPayload,
  StripeConfirmPayload,
  StripeCheckoutSessionResponse,
} from '../types';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery,
  tagTypes: ['Orders', 'Cart'],
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
      invalidatesTags: [
        { type: 'Orders', id: 'LIST' },
        { type: 'Cart', id: 'LIST' },
      ],
    }),
    createStripeCheckoutSession: builder.mutation<
      StripeCheckoutSessionResponse,
      CreateOrderPayload
    >({
      query: (payload) => ({
        url: '/payments/stripe/checkout-session',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),
    createPaypalOrder: builder.mutation<PaypalCreateOrderResponse, CreateOrderPayload>({
      query: (payload) => ({
        url: '/payments/paypal/orders',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),
    capturePaypalOrder: builder.mutation<Order, PaypalCapturePayload>({
      query: (payload) => ({
        url: '/payments/paypal/orders/capture',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [
        { type: 'Orders', id: 'LIST' },
        { type: 'Cart', id: 'LIST' },
      ],
    }),
    confirmStripeCheckoutSession: builder.mutation<Order, StripeConfirmPayload>({
      query: (payload) => ({
        url: '/payments/stripe/checkout-session/confirm',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [
        { type: 'Orders', id: 'LIST' },
        { type: 'Cart', id: 'LIST' },
      ],
    }),
    createRazorpayOrder: builder.mutation<RazorpayCreateOrderResponse, CreateOrderPayload>({
      query: (payload) => ({
        url: '/payments/razorpay/orders',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),
    verifyRazorpayPayment: builder.mutation<Order, RazorpayVerifyPayload>({
      query: (payload) => ({
        url: '/payments/razorpay/verify',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [
        { type: 'Orders', id: 'LIST' },
        { type: 'Cart', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useMyOrdersQuery,
  useOrderDetailQuery,
  useCreateOrderMutation,
  useCreateStripeCheckoutSessionMutation,
  useConfirmStripeCheckoutSessionMutation,
  useCreatePaypalOrderMutation,
  useCapturePaypalOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = ordersApi;
