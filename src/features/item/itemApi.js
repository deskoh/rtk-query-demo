import { api } from 'features/api/apiSlice';
import { updateOrderAction } from 'features/order/orderApi';
import { providesId } from 'features/api/utils';
import { saveInitialOrderItemIds } from './itemSlice'
import { store } from 'app/store';

// Invalidate specific OrderItems tags to trigger refetch.
// Without orderId, all OrderItems not subscribed will be removed
const invalidatesTags =  (_result, _error, arg) => [{ type: 'OrderItems', id: arg.orderId ?? arg }];

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
      query: ({ orderId }) => ({
        url: `searchItems${orderId ? `?orderId=${orderId}` : ''}`,
        method: 'POST',
      }),
      // Provide cache key manually
      serializeQueryArgs: ({ queryArgs }) => {
        const { orderId } = queryArgs;
        return `searchItems(${JSON.stringify(orderId)})`;
      },
      providesTags: (result, error, { orderId }) => providesId(result, orderId, 'OrderItems'),
      // Store original item IDs in redux store to track deletion
      async onQueryStarted({ orderId }, { dispatch, queryFulfilled }) {
        const { data: items } = await queryFulfilled;
        dispatch(saveInitialOrderItemIds({ orderId, itemIds: items.map(i => i.id) }));
      },
    }),
    // Batch queries results will be populated from `searchItems` if exists.
    // Return results will be used to populated back to `searchItems` cache as well.
    searchItemsBatch: builder.query({
      // Using queryFn to optimize the query by removing OrderIds already in cache
      queryFn: async ({ orderIds = [] }, _api, _extraOptions, baseQuery) => {
        const strippedOrderIds = [...orderIds];
        // Construct partial results for items already in cache.
        const cachedPartialData = orderIds.reduce((cachedItems, orderId) => {
          const { data: items } = itemApi.endpoints.searchItems.select({ orderId })(store.getState());
          if (items) {
            // Remove orderId to prevent duplicate query
            strippedOrderIds.splice(strippedOrderIds.indexOf(orderId), 1);
            cachedItems[orderId] = items;
          }
          return cachedItems;
        }, {});

        // Skip request if all orderIds are already in cache
        const result = strippedOrderIds.length > 0 
          ? await baseQuery({
            url: 'searchItems',
            method: 'POST',
            body: { orderIds: strippedOrderIds },
          })
          : { data: {} };
        
        // Merge cachedPartialData into result.data
        const data = { ...cachedPartialData, ...result.data };
        return { data };
      },
      // Do not cache batch queries the cache will be populated from `searchItems` query cache
      keepUnusedDataFor: 0,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        Object.entries(data).forEach(([orderId, items]) => {
          // Add to searchItems cache if it does not exists. No should be required as data in the cache will be the same.
          const { data: searchItemsCache  } = itemApi.endpoints.searchItems.select({ orderId })(store.getState());
          if (!searchItemsCache) {
            // First insertion into cache seemed will trigger `searchItems` onQueryStarted
            dispatch(api.util.upsertQueryData('searchItems', { orderId }, items));
          }
          // Following not required as the above seemed to trigger `searchItems` onQueryStarted
          // Store original item IDs in redux store to track deletion
          // dispatch(saveInitialOrderItemIds({ orderId, itemIds: items.map(i => i.id) }));
        });
      },
    }),
    upsertOrderItems: builder.mutation({
      query: ({ items, orderId}) => ({
        url: `item?orderId=${orderId}`,
        method: 'PUT',
        body: items,
      }),
      invalidatesTags,
    }),
    // Combine upsertOrderItems and deleteOrderItems as dispatching both actions seperately will
    // invalidate `OrderItems` tag twice, resulting in double refetch
    upsertAndDeleteOrderItems: builder.mutation({
      async queryFn({ orderId, upsertItems, deleteIds}, _queryApi, _extraOptions, baseQuery) {
        const [upserted, deleted] = await Promise.all([
          upsertItems.length > 0 ? baseQuery({
            url: `item?orderId=${orderId}`,
            method: 'PUT',
            body: upsertItems,
          }) : Promise.resolve([]),
          deleteIds.length > 0 ? baseQuery({
            url: 'item',
            method: 'DELETE',
            body: deleteIds,
          }) : Promise.resolve([]),
        ]);
        return { upserted, deleted };
      },
      invalidatesTags,
    }),
    deleteOrderItems: builder.mutation({
      query: (orderId) => ({
        url: `item?orderId=${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags,
    }),
  }),
})

export const {
  useGetItemByIdQuery,
  useUpsertOrderItemsMutation,
  useDeleteOrderItemsMutation,
  useUpsertAndDeleteOrderItemsMutation,
  // Temp export for testing
  useSearchItemsBatchQuery,
} = itemApi;

const { useSearchItemsQuery } = itemApi;

export const useSearchItemsQueryState = itemApi.endpoints.searchItems.useQueryState;

export const useGetOrderItemsQuery = (orderIds = [], options) => {
  const orderIdsArray = Array.isArray(orderIds) ? orderIds : [orderIds];
  if (orderIdsArray.length <= 1) {
    return useSearchItemsQuery({
      orderId: orderIdsArray[0],
    }, { skip: orderIdsArray.length === 0, ...options })
  }
  return useSearchItemsBatchQuery({
    orderIds: orderIdsArray,
  }, options)
}

// Export methods to update cache
export const editOrderItemAction = (orderId, editedItem) => (dispatch) => {
  dispatch(itemApi.util.updateQueryData(
    // Update cache entry with key `searchItems({ orderId })`
    'searchItems', { orderId }, (draftItems) => {
      const index = draftItems.findIndex(o => o.id === editedItem.id);
      draftItems[index] = { ...editedItem , __isDirty: true };
    }
  ));
  // Update parent order to mark as dirty
  dispatch(updateOrderAction(orderId));
}

export const addOrderItemAction = (orderId, newItem) => (dispatch) => {
  dispatch(itemApi.util.updateQueryData(
    // Update cache entry with key `searchItems({ orderId })`
    'searchItems', { orderId }, (draftItems) => {
      // Generate client-side unique ID temporarily
      draftItems.push({ ...newItem, __isDirty: true });
    }
  ));

  // Update parent order
  dispatch(updateOrderAction(
    orderId,
    (draftOrder) => { draftOrder.itemsCount = '...'; },
  ));
}

export const deleteOrderItemAction = (orderId, itemId) => (dispatch) => {
  dispatch(itemApi.util.updateQueryData(
    // Update cache entry with key `searchItems({ orderId })`
    'searchItems', { orderId }, (draftItems) => {
      const index = draftItems.findIndex(o => o.id === itemId);
      if (index > -1) {
        draftItems.splice(index, 1);
      }
    }
  ));
  // Update parent order to mark as dirty
  dispatch(updateOrderAction(orderId));
}

export const clearOrderItemsAction = (orderId) => (dispatch) => {
  dispatch(itemApi.util.updateQueryData(
    // Update cache entry with key `searchItems({ orderId })`
    'searchItems', { orderId }, (draftItems) => {
      draftItems.length = 0;
    }
  ));
  // Update parent order to mark as dirty
  dispatch(updateOrderAction(orderId));
}
