import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useGetOrdersQuery, orderApi } from 'features/order/orderApi';
import { useSearchItemsBatchQuery } from "features/item/itemApi";

const BatchTest = () => {
  const { data } = useGetOrdersQuery();
  const [items, setItems] = useState([]);
  const dispatch = useDispatch();

  // const orderIds = data?.map((order) => order.id).slice(1) || [];
  // const { data: orderItems } = useSearchItemsBatchQuery({ orderIds });
  // useEffect(() => {
  //   const allItems = Object.values(orderItems || {}).reduce((acc, item) => acc.concat(item), []);
  //   setItems(allItems);
  // }, [orderItems]);

  const test = async () => {
      // Get 2nd order Ids onwards
      const orderIds = data.map((order) => order.id).slice(1);
      const { data: orderItems } = await dispatch(orderApi.endpoints.searchItemsBatch.initiate({ orderIds }, { forceRefetch: true }));
      // Concatenate array of arrays
      const allItems = Object.values(orderItems).reduce((acc, item) => acc.concat(item), []);
      setItems(allItems);
    }

  return (
    <div>
      <button onClick={test}>Test Batch</button>
      <p>Items:</p>
        {items.map((item) => (
          <p key={item.id}>Order ID: {item._orderId} | Name: {item.name}</p>
        ))}
    </div>
  );
}

export default BatchTest;
