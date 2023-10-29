import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { providesList } from './utils';
import { mergeRetainDirty } from '../mocks/services/utils';

// Define a service using a base URL and expected endpoints
export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1/' }),
  keepUnusedDataFor: Number.MAX_SAFE_INTEGER,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  // tagTypes: ['Order'],
  endpoints: (builder) => ({
    // Cache key: getOrders(undefined)
    getOrders: builder.query({
      query: () => 'order',
      transformResponse: (orders) => orders.map(o => ({...o, itemsCount: '...'})),
      providesTags: (result) => providesList(result, 'Order'),
      // Manual merge the cache to keep 'dirty' orders intact when tag 'Order' is invalidated by upsertOrder / deleteOrder
      merge: (currentCache, orders) => {
        // Remove deleted orders if it is not dirty
        const newCache = currentCache.filter(curr => curr.__isDirty || orders.some(o => o.id === curr.id))
        // Remove new orders into current cache if it is not dirty
        const result = mergeRetainDirty(newCache, orders, (curr, o) => curr.id === o.id);
        return result;
      },
    }),
    upsertOrder: builder.mutation({
      query: (order) => ({
        url: 'order',
        method: 'PUT',
        body: order,
      }),
      // Trigger re-fetch of `getOrders`, modified orders are not overwritten due to custom merge specified
      invalidatesTags: ['Order'],
      // Clear isDirty flag
      async onQueryStarted(order, { dispatch }) {
        dispatch(
          orderApi.util.updateQueryData('getOrders', undefined, (draftOrders) => {
            const index = draftOrders.findIndex(o => o.id === order.id);
            // Index will be -1 for newly created order
            if (index > -1) delete draftOrders[index].__isDirty;
          }),
        );
      },
    }),
    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `order/${orderId}`,
        method: 'DELETE',
      }),
      // Trigger re-fetch of `getOrders`, modified orders are not overwritten due to custom merge specified
      invalidatesTags: ['Order'],
      // Clear any dirty flag so that it will be removed when merging cache above
      // (not required if isDirty flag not checked in merge method)....
      // TODO: try undo?
      async onQueryStarted(orderId, { dispatch }) {
        dispatch(
          orderApi.util.updateQueryData('getOrders', undefined, (draftOrders) => {
            const index = draftOrders.findIndex(o => o.id === orderId);
            delete draftOrders[index].__isDirty;
          }),
        );
      },
    }),
  }),
})

export const { useGetOrdersQuery, useUpsertOrderMutation, useDeleteOrderMutation } = orderApi

export const useGetOrderByIdQuery = (orderId) => useGetOrdersQuery(undefined, {
  skip: !orderId,
  // Use `selectFromResult` to reuse cache from useGetOrdersQuery to avoid stale order
  // when cache is modified
  selectFromResult: ({ data: orders }) => {
    return { data: orders?.find(o => o.id === orderId) }
  },
});

// Export methods to update cache

// Tricky to keep track of new order has been persisted when deleting order
// as persisted order needs will require mutation, non-persisted order will require cache update
// USe `useUpsertOrderMutation` instead to ensure new orders ALWAYS persisted.
// export const addOrderAction = (newOrder) => orderApi.util.updateQueryData(
//   // Update cache entry with key `getOrders(undefined)`
//   'getOrders', undefined, (draftOrders) => {
//     draftOrders.push(newOrder);
//   }
// )

export const updateOrderAction = (orderId, editedOrderOrFn) => orderApi.util.updateQueryData(
  // Update cache entry with key `getOrders(undefined)`
  'getOrders', undefined, (draftOrders) => {
    const index = draftOrders.findIndex(o => o.id === orderId);
    if (typeof editedOrderOrFn === 'function') {
      editedOrderOrFn(draftOrders[index]);
    } else if (editedOrderOrFn !== undefined) {
      draftOrders[index] = editedOrderOrFn;
    }
    draftOrders[index].__isDirty = true;

    // Update new fields if necessary as `transformResponse` is not triggered.
    // draftOrders[index].itemsCount = '...';
  }
)
