import { useEffect, useState } from 'react';

import { useSelectedOrder } from 'features/order/orderSlice';
import { publishMessageToClient } from 'mocks/socketServer';

const publishEvent = (event, formData) => {
  const { type, ...payload } = formData;
  publishMessageToClient({ type, event, payload });
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
        <label htmlFor="id">ID:</label>
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
      <button onClick={() => publishEvent('create', formData)}>Create</button>
      <button onClick={() => publishEvent('update', formData)}>Update</button>
      <button onClick={() => publishEvent('delete', formData)}>Delete</button>
    </div>
  );
}
export default DevTool;
