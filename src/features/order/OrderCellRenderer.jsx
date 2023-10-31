import  { useGetOrderByIdQuery, useUpsertOrderMutation, useDeleteOrderMutation } from './orderApi';
import {
  useSearchItemsQueryState,
  useDeleteOrderItemsMutation,
  useUpsertAndDeleteOrderItemsMutation,
} from 'features/item/itemApi';
import { useInitialOrderItemIds } from 'features/item/itemSlice';


const OrderCellRenderer = ({ data }) => {
  // props.data might be stale when cache is mutated in cache
  const { data: order } = useGetOrderByIdQuery(data.id);

  // Use `useQueryState` instead of `useGetOrderItemsQuery` to lazily read items from cache
  // instead of firing query when rows are rendered
  const { data: items } = useSearchItemsQueryState({ orderId: data.id });
  const initialItemIds = useInitialOrderItemIds(data.id);

  const [upsertOrder] = useUpsertOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [deleteOrderItems] = useDeleteOrderItemsMutation();
  const [upsertAndDeleteOrderItems]= useUpsertAndDeleteOrderItemsMutation();

  const saveOrderHandler = async () => {
    try {
      // Alternative means to read cache:
      // itemApi.endpoints.searchItems.select({ orderId: data.id })(store.getState());
      const deletedIds = initialItemIds.filter(id => !items.some(i => i.id === id));
      const editedItems = items.filter(i => i.__isDirty);
      await Promise.all([
        upsertOrder(order).unwrap(),
        upsertAndDeleteOrderItems({
          orderId: data.id,
          upsertItems: editedItems,
          deleteIds: deletedIds
        }).unwrap()
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrderHandler = async () => {
    try {
      await Promise.all([
        deleteOrder(data.id).unwrap(),
        deleteOrderItems(data.id).unwrap(),
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <span>
      <button
        onClick={() => saveOrderHandler()}
        // Ensure items are loaded
        disabled={!order?.__isDirty || !items}
      >
        Save
      </button>
      <button onClick={() => deleteOrderHandler()}>
        Delete
      </button>
    </span>
  );
};

export default OrderCellRenderer;
