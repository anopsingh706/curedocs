import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Vite bakes VITE_* variables at BUILD TIME.
// .env.production is read automatically by Vite when building for production.
// If the env var is missing, we fall back to the hardcoded Render URL below.
const RENDER_URL = 'https://curedocs.onrender.com';

const baseUrl = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : import.meta.env.DEV
    ? '/api'                    // local dev → Vite proxy handles it
    : `${RENDER_URL}/api`;      // production fallback

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