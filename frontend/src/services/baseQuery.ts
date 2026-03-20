import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { getEnvConfig } from '../config';

const { apiBaseUrl } = getEnvConfig();

export const baseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
