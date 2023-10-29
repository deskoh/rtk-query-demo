import  { useGetOrderByIdQuery, useUpsertOrderMutation, useDeleteOrderMutation } from './orderApi';
import {
  useSearchItemsQueryState,
  useUpsertOrderItemsMutation,
  useDeleteItemsMutation,
} from '../item/itemApi';
import { useInitialOrderItemIds } from '../item/itemSlice';


const OrderCellRenderer = ({ data }) => {
  // props.data might be stale when cache is mutated in cache
  const { data: order } = useGetOrderByIdQuery(data.id);
  
  // Use `useQueryState` instead of useGetOrderItemsQuery to avoid query when rows are rendered
  const { data: items } = useSearchItemsQueryState({ orderId: data.id });
  const initialItemIds = useInitialOrderItemIds(data.id);
  
  const [upsertOrder] = useUpsertOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [upsertOrderItems] = useUpsertOrderItemsMutation();
  const [deleteOrderItems] = useDeleteItemsMutation();
  
  const saveOrderHandler = async () => {
    try {
      const deletedIds = initialItemIds.filter(id => !items.some(i => i.id === id));
      const editedItems = items.filter(i => i.__isDirty);
      // TODO: upsertOrderItems and deleteOrderItems will invalidate same tags twice
      // and will result in duplicate refetch
      // Merge into single mutation: https://github.com/reduxjs/redux-toolkit/issues/2203
      await Promise.all([
        upsertOrder(order).unwrap(),
        editedItems.length === 0
          ? Promise.resolve()
          : upsertOrderItems({ orderId: data.id, items: editedItems }).unwrap(),
        deletedIds.length === 0
          ? Promise.resolve()
          : deleteOrderItems(deletedIds),
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrderHandler = async () => {
    try {
      await deleteOrder(data.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <span>
      <button
        onClick={() => saveOrderHandler()}
        // disabled={!items} // Enable saving after items are loaded
        disabled={!order?.__isDirty}
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
