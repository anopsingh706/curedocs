import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// In production (Vercel), VITE_API_BASE_URL = https://your-render-url.onrender.com
// In development, we use the Vite proxy so base is just '/api'
const baseUrl = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.userInfo?.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Files', 'Categories', 'Stats'],
  endpoints: () => ({}),
});