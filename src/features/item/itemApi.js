import { api } from '../api/apiSlice';
import { updateOrderAction } from '../order/orderApi';
import { providesId } from '../api/utils';
import { saveInitialOrderItemIds } from './itemSlice'

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
} = itemApi;

const { useSearchItemsQuery } = itemApi;

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
