import { useDispatch } from 'react-redux';
import { deleteOrderItemAction } from '../item/itemApi';

const ItemCellRenderer = ({ data }) => {
  const dispatch = useDispatch();
  const deleteItem = async () => {
    dispatch(deleteOrderItemAction(data._orderId, data.id));
  };

  return (
    <span>
      <button onClick={() => deleteItem()}>Delete</button>
    </span>
  );
};

export default ItemCellRenderer;
