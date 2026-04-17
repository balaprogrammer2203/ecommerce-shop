import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { Product, ProductListResponse } from '../../catalog/types';
import { Order } from '../../orders/types';
import { AdminCategory, AdminCategoryAttribute, AdminProductInput, AdminUser } from '../types';

export type AdminProductsQueryParams = {
  page?: number;
  limit?: number;
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  featured?: boolean;
  trending?: boolean;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
};

export type AdminOrdersQueryParams = {
  sortBy?: 'order' | 'customer' | 'product' | 'status' | 'date' | 'trend' | 'amount';
  sortOrder?: 'asc' | 'desc';
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery,
  tagTypes: [
    'AdminProducts',
    'AdminOrders',
    'AdminUsers',
    'AdminCategories',
    'AdminCategoryAttributes',
  ],
  endpoints: (builder) => ({
    adminProducts: builder.query<ProductListResponse, AdminProductsQueryParams | void>({
      query: (params) => {
        const p = params ?? {};
        return {
          url: '/products',
          params: {
            page: p.page ?? 1,
            limit: p.limit ?? 20,
            keyword: p.keyword || undefined,
            categoryId: p.categoryId || undefined,
            minPrice: p.minPrice,
            maxPrice: p.maxPrice,
            brand: p.brand || undefined,
            featured: p.featured,
            trending: p.trending,
            sort: p.sort || undefined,
          },
        };
      },
      providesTags: [{ type: 'AdminProducts', id: 'LIST' }],
    }),
    createAdminProduct: builder.mutation<Product, AdminProductInput>({
      query: (payload) => ({
        url: '/products',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminProducts', id: 'LIST' }],
    }),
    updateAdminProduct: builder.mutation<
      Product,
      { id: string; payload: Partial<AdminProductInput> }
    >({
      query: ({ id, payload }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminProducts', id: 'LIST' }],
    }),
    deleteAdminProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminProducts', id: 'LIST' }],
    }),
    adminCategories: builder.query<AdminCategory[], { active?: 'all' | 'true' | 'false' } | void>({
      query: (params) => ({
        url: '/categories',
        params: { active: params?.active ?? 'all' },
      }),
      providesTags: [{ type: 'AdminCategories', id: 'LIST' }],
    }),
    createAdminCategory: builder.mutation<
      AdminCategory,
      Partial<
        Pick<AdminCategory, 'name' | 'slug' | 'description' | 'parentId' | 'isActive' | 'image'>
      >
    >({
      query: (payload) => ({
        url: '/categories',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminCategories', id: 'LIST' }],
    }),
    updateAdminCategory: builder.mutation<
      AdminCategory,
      {
        id: string;
        payload: Partial<
          Pick<
            AdminCategory,
            'name' | 'slug' | 'description' | 'parentId' | 'isActive' | 'image' | 'sortOrder'
          >
        >;
      }
    >({
      query: ({ id, payload }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminCategories', id: 'LIST' }],
    }),
    deleteAdminCategory: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminCategories', id: 'LIST' }],
    }),
    adminCategoryAttributes: builder.query<AdminCategoryAttribute[], { categoryId: string }>({
      query: (params) => ({
        url: '/category-attributes',
        params: { categoryId: params.categoryId },
      }),
      providesTags: [{ type: 'AdminCategoryAttributes', id: 'LIST' }],
    }),
    createAdminCategoryAttribute: builder.mutation<
      AdminCategoryAttribute,
      Partial<
        Pick<
          AdminCategoryAttribute,
          'categoryId' | 'key' | 'label' | 'values' | 'sortOrder' | 'isActive'
        >
      >
    >({
      query: (payload) => ({
        url: '/category-attributes',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminCategoryAttributes', id: 'LIST' }],
    }),
    updateAdminCategoryAttribute: builder.mutation<
      AdminCategoryAttribute,
      {
        id: string;
        payload: Partial<
          Pick<AdminCategoryAttribute, 'key' | 'label' | 'values' | 'sortOrder' | 'isActive'>
        >;
      }
    >({
      query: ({ id, payload }) => ({
        url: `/category-attributes/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminCategoryAttributes', id: 'LIST' }],
    }),
    deleteAdminCategoryAttribute: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/category-attributes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminCategoryAttributes', id: 'LIST' }],
    }),
    adminOrders: builder.query<Order[], AdminOrdersQueryParams | void>({
      query: (params) => ({
        url: '/orders',
        params: {
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),
    adminOrderById: builder.query<Order, string>({
      query: (id) => ({ url: `/orders/${id}` }),
    }),
    markOrderPaid: builder.mutation<Order, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}/pay`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),
    updateAdminOrder: builder.mutation<
      Order,
      {
        id: string;
        payload: {
          paymentMethod?: 'stripe' | 'paypal' | 'razorpay' | 'cod';
          shippingAddress?: {
            address: string;
            city: string;
            postalCode: string;
            country: string;
          };
        };
      }
    >({
      query: ({ id, payload }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),
    updateAdminOrderDelivery: builder.mutation<
      Order,
      {
        id: string;
        payload: {
          action:
            | 'update_tracking'
            | 'set_status'
            | 'mark_delivery_failed'
            | 'reschedule'
            | 'cancel_delivery'
            | 'trigger_return'
            | 'trigger_refund';
          payload?: {
            nextStatus?:
              | 'order_placed'
              | 'payment_pending'
              | 'payment_confirmed'
              | 'payment_failed'
              | 'processing'
              | 'packed'
              | 'ready_to_ship'
              | 'shipped'
              | 'in_transit'
              | 'out_for_delivery'
              | 'delivered'
              | 'delivery_attempt_failed'
              | 'delivery_rescheduled'
              | 'delivery_exception'
              | 'cancelled'
              | 'return_requested'
              | 'return_approved'
              | 'return_pickup_scheduled'
              | 'return_picked_up'
              | 'return_in_transit'
              | 'return_received'
              | 'return_rejected'
              | 'refund_initiated'
              | 'refund_completed'
              // legacy compatibility
              | 'pending'
              | 'delivery_failed'
              | 'rescheduled'
              | 'return_initiated'
              | 'refunded';
            subStatus?: string;
            description?: string;
            actor?: 'admin' | 'system' | 'courier';
            courierDetails?: {
              partner?: string;
              trackingId?: string;
              trackingUrl?: string;
              estimatedDeliveryAt?: string;
            };
          };
        };
      }
    >({
      query: ({ id, payload }) => ({
        url: `/orders/${id}/delivery`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),
    deleteAdminOrder: builder.mutation<{ message: string }, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),
    deleteAdminOrdersBulk: builder.mutation<
      { message: string; deletedCount: number },
      { orderIds: string[] }
    >({
      query: (payload) => ({
        url: '/orders',
        method: 'DELETE',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminOrders', id: 'LIST' }],
    }),
    adminUsers: builder.query<AdminUser[], void>({
      query: () => ({ url: '/admin/users' }),
      providesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),
    updateAdminUser: builder.mutation<AdminUser, { id: string; payload: Partial<AdminUser> }>({
      query: ({ id, payload }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),
    deleteAdminUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminUsers', id: 'LIST' }],
    }),
    uploadAdminProductImage: builder.mutation<{ imageUrl: string }, { imageBase64: string }>({
      query: (payload) => ({
        url: '/admin/uploads/product-image',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useAdminProductsQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useAdminCategoryAttributesQuery,
  useCreateAdminCategoryAttributeMutation,
  useUpdateAdminCategoryAttributeMutation,
  useDeleteAdminCategoryAttributeMutation,
  useAdminOrdersQuery,
  useAdminOrderByIdQuery,
  useMarkOrderPaidMutation,
  useUpdateAdminOrderMutation,
  useUpdateAdminOrderDeliveryMutation,
  useDeleteAdminOrderMutation,
  useDeleteAdminOrdersBulkMutation,
  useAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUploadAdminProductImageMutation,
} = adminApi;
