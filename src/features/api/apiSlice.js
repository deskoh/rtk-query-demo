import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  // All of our requests will have URLs starting with '/api/v1/'
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  keepUnusedDataFor: Number.MAX_SAFE_INTEGER,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  // The "endpoints" represent operations and requests for this server
  endpoints: () => ({}),
});

export const { util } = api;
