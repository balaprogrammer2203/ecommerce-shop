import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery } from '../../../services/baseQuery';
import { AuthResponse, BackendAuthResponse, BackendMeResponse } from '../types';

const toAuthResponse = (data: BackendAuthResponse): AuthResponse => ({
  user: {
    id: data._id,
    name: data.name,
    email: data.email,
    role: data.role,
    phone: data.phone || '',
    dateOfBirth: data.dateOfBirth || null,
    address: data.address || {},
    profileImageUrl: data.profileImageUrl || '',
    security: data.security || { twoFactorEnabled: false, lastLoginAt: null, activeSessions: [] },
  },
  token: data.token,
});

const toUser = (data: BackendMeResponse): AuthResponse['user'] => ({
  id: data._id,
  name: data.name,
  email: data.email,
  role: data.role,
  phone: data.phone || '',
  dateOfBirth: data.dateOfBirth || null,
  address: data.address || {},
  profileImageUrl: data.profileImageUrl || '',
  security: data.security || { twoFactorEnabled: false, lastLoginAt: null, activeSessions: [] },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: BackendAuthResponse) => toAuthResponse(response),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string }>({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: BackendAuthResponse) => toAuthResponse(response),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    currentUser: builder.query<AuthResponse['user'], void>({
      query: () => ({ url: '/auth/me' }),
      transformResponse: (response: BackendMeResponse) => toUser(response),
      providesTags: ['Auth'],
    }),
    updateCurrentUser: builder.mutation<
      AuthResponse['user'],
      {
        name?: string;
        email?: string;
        password?: string;
        phone?: string;
        dateOfBirth?: string | null;
        profileImageUrl?: string;
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          postalCode?: string;
          country?: string;
        };
      }
    >({
      query: (payload) => ({
        url: '/auth/me',
        method: 'PUT',
        body: payload,
      }),
      transformResponse: (response: BackendMeResponse) => toUser(response),
      invalidatesTags: ['Auth'],
    }),
    uploadProfileImage: builder.mutation<{ profileImageUrl: string }, { imageBase64: string }>({
      query: (payload) => ({
        url: '/auth/me/profile-image',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useUploadProfileImageMutation,
} = authApi;
