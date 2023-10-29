import { useDispatch } from 'react-redux';
import { deleteOrderItemAction } from '../item/itemApi';
import { updateOrderAction } from '../order/orderApi';

const ItemCellRenderer = ({ data }) => {
  const dispatch = useDispatch();
  const deleteItem = async () => {
    dispatch(deleteOrderItemAction(data._orderId, data.id));

    // Update parent order to mark as dirty
    dispatch(updateOrderAction(data._orderId));
  };

  return (
    <span>
      <button onClick={() => deleteItem()}>Delete</button>
    </span>
  );
};

export default ItemCellRenderer;
