import { api } from '../api/apiSlice';

import { providesId } from '../api/utils';
import { saveInitialOrderItemIds } from './itemSlice'

// Define a service using a base URL and expected endpoints
export const itemApi = api.injectEndpoints({
  // tagTypes: ['Item'],
  endpoints: (builder) => ({
    getItemById: builder.query({
      query: (id) => `item/${id}`,
      providesTags: (result, error, id) => providesId(result, id, 'Item'),
    }),
    searchItems: builder.query({
      // Using POST for Query instead of GET
      query: ({ orderId, itemIds }) => ({
        url: `searchItems${orderId ? `?orderId=${orderId}` : ''}`,
        method: 'POST',
        body: itemIds || [],
      }),
      // Provide cache key manually to omit itemIds
      serializeQueryArgs: ({ queryArgs }) => {
        const { orderId } = queryArgs
        return { orderId } // omit `client` from the cache key
      },
      providesTags: (result, error, { orderId }) => providesId(result, orderId, 'OrderItems'),
      // Store original item IDs to track deletion
      async onQueryStarted({ orderId }, { dispatch, queryFulfilled }) {
        const { data: items } = await queryFulfilled;
        dispatch(saveInitialOrderItemIds({ orderId, itemIds: items.map(i => i.id) }));
      },
    }),
    upsertOrderItems: builder.mutation({
      query: ({ items, orderId}) => ({
        url: `item?orderId=${orderId}`,
        method: 'PUT',
        body: items,
      }),
      // Following will re-fetch currently subscribed searchItems which is ok
      invalidatesTags: ['OrderItems'],
      // Manual refetch below not required due to tag invalidation
      // async onQueryStarted({ orderId }, { dispatch, queryFulfilled }) {
      //   try {
      //     // Update items cache by forcing refetch
      //     await queryFulfilled;
      //     dispatch(itemApi.endpoints.searchItems.initiate(
      //       { orderId },
      //       { subscribe: false, forceRefetch: true }
      //     ));
      //   } catch (err) {
      //     // TODO: handle error
      //   }
      // },
    }),
    deleteItems: builder.mutation({
      query: (itemIds) => ({
        url: 'item',
        method: 'DELETE',
        body: itemIds,
      }),
      invalidatesTags: ['OrderItems'],
    }),
    deleteOrderItems: builder.mutation({
      query: (orderId) => ({
        url: `item?orderId=${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrderItems'],
    }),
  }),
})

const {
  useGetItemByIdQuery,
  useSearchItemsQuery,
  useUpsertOrderItemsMutation,
  useDeleteItemsMutation,
} = itemApi
export { useGetItemByIdQuery, useUpsertOrderItemsMutation, useDeleteItemsMutation };

export const useSearchItemsQueryState = itemApi.endpoints.searchItems.useQueryState;

export const useGetOrderItemsQuery = (order, options) => {
  const { id, items } = order || {};
  const query = useSearchItemsQuery({
    orderId: id,
    itemIds: items,  
  }, { skip: !order, ...options })
  return query;
}

// Export methods to update cache
export const editOrderItemAction = (orderId, editedItem) => itemApi.util.updateQueryData(
  // Update cache entry with key `searchItems({ orderId })`
  'searchItems', { orderId }, (draftItems) => {
    const index = draftItems.findIndex(o => o.id === editedItem.id);
    draftItems[index] = editedItem;
  }
)

export const addOrderItemAction = (orderId, newItem) => itemApi.util.updateQueryData(
  // Update cache entry with key `searchItems({ orderId })`
  'searchItems', { orderId }, (draftItems) => {
    // Generate client-side unique ID temporarily
    draftItems.push(newItem);
  }
)

export const deleteOrderItemAction = (orderId, itemId) => itemApi.util.updateQueryData(
  // Update cache entry with key `searchItems({ orderId })`
  'searchItems', { orderId }, (draftItems) => {
    const index = draftItems.findIndex(o => o.id === itemId);
    if (index > -1) {
      draftItems.splice(index, 1);
    }
  }
)

export const clearOrderItemsAction = (orderId) => itemApi.util.updateQueryData(
  // Update cache entry with key `searchItems({ orderId })`
  'searchItems', { orderId }, (draftItems) => {
    draftItems.length = 0;
  }
)
