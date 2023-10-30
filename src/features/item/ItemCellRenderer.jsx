import { useDispatch } from 'react-redux';
import { deleteOrderItemAction } from '../item/itemApi';
import { updateOrderAction } from '../order/orderApi';

const deleteItemAction = (orderId, itemId) => (dispatch) => {
  dispatch(deleteOrderItemAction(orderId, itemId));
  // Update parent order to mark as dirty
  dispatch(updateOrderAction(orderId));
}

const ItemCellRenderer = ({ data }) => {
  const dispatch = useDispatch();
  const deleteItem = async () => {
    dispatch(deleteItemAction(data._orderId, data.id));
  };

  return (
    <span>
      <button onClick={() => deleteItem()}>Delete</button>
    </span>
  );
};

export default ItemCellRenderer;
