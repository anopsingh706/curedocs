import { apiSlice } from './apiSlice.js';

export const filesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query({
      query: (params = {}) => ({ url: '/files', params }),
      providesTags: ['Files'],
    }),
    getFile: builder.query({
      query: (id) => `/files/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Files', id }],
    }),
    getStats: builder.query({
      query: () => '/files/stats',
      providesTags: ['Stats'],
    }),
    uploadFile: builder.mutation({
      query: (formData) => ({ url: '/files/upload', method: 'POST', body: formData }),
      invalidatesTags: ['Files', 'Stats'],
    }),
    updateFile: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/files/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Files'],
    }),
    togglePublish: builder.mutation({
      query: (id) => ({ url: `/files/${id}/publish`, method: 'PATCH' }),
      invalidatesTags: ['Files', 'Stats'],
    }),
    deleteFile: builder.mutation({
      query: (id) => ({ url: `/files/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Files', 'Stats'],
    }),
  }),
});

export const {
  useGetFilesQuery,
  useGetFileQuery,
  useGetStatsQuery,
  useUploadFileMutation,
  useUpdateFileMutation,
  useTogglePublishMutation,
  useDeleteFileMutation,
} = filesApi;
