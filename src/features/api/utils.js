import { Fragment, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useGetOrdersQuery } from 'features/order/orderApi';
import { itemApi, useSearchItemsQueryState } from 'features/item/itemApi';

/**
 * Called when query results returned or cache mutated manually to recalculate tags
 */
export function providesList(resultsWithIds = [], tagType) {
  return [
    { type: tagType, id: 'LIST' },
    ...resultsWithIds.map(({ id }) => ({ type: tagType, id })),
  ];
}

export function providesId(resultsWithId, id, tagType) {
  return resultsWithId
    ? [{ type: tagType, id }]
    : ['NOT_FOUND']
}

export const useIsLoading = () => useSelector(
  state => Object.values(state.api.queries)
    .some(query => query.status === 'pending')
);

export const Dropdown = () => {
  const { data: orders } = useGetOrdersQuery();
  const prefetchItems = itemApi.usePrefetch('searchItems');
  useEffect(() => {
    orders?.forEach((order) => {
      prefetchItems({ orderId: order.id });
    });
  }, [orders, prefetchItems])

  return (
    <select>
      {orders?.map((order) => (
        <OrderItems key={order.id} order={order} />
      ))}
    </select>
  )
}

const OrderItems = ({ order }) => {
  const { data: items } = useSearchItemsQueryState({ orderId: order.id });
  return (
    <Fragment key={order.id}>
      <optgroup label={order.name}></optgroup>
      {items?.map((item) => (
         <option value="{item.id}">{item.name}</option>
      ))}
    </Fragment>
  );
};
