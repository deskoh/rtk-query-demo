import { useEffect, useState } from 'react';

import { useSelectedOrder } from 'features/order/orderSlice';
import { upsertOrder, deleteOrder } from 'mocks/services/order';

const serverCreate = (formData) => {
  if (formData.type === 'order') {
    upsertOrder(undefined, formData.name)
  }
}

const serverUpdate = (formData) => {
  if (formData.type === 'order') {
    upsertOrder(formData.id, formData.name)
  }
}

const serverDelete = (formData) => {
  if (formData.type === 'order') {
    deleteOrder(formData.id)
  }
}

const DevTool = () => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'order'
  });

  const { data: selectedOrder } = useSelectedOrder();
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      id: selectedOrder?.id || '',
    }));
  }, [selectedOrder?.id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="devTool">
      <b>Event Simulator</b>
      <div>
        <label htmlFor="id">ID (Create / Delete):</label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Type:</label>
        <label>
          <input
            type="radio"
            name="type"
            value="order"
            checked={formData.type === 'order'}
            onChange={handleInputChange}
          />
          Order
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="item"
            checked={formData.type === 'item'}
            onChange={handleInputChange}
          />
          Item
        </label>
      </div>
      <button onClick={() => serverCreate(formData)}>Create</button>
      <button onClick={() => serverUpdate(formData)}>Update</button>
      <button onClick={() => serverDelete(formData)}>Delete</button>
    </div>
  );
}
export default DevTool;
