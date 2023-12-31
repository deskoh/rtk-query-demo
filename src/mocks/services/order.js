import { nanoid } from '@reduxjs/toolkit';
import { http, HttpResponse, delay } from 'msw';

import { getOrders, saveOrders } from 'mocks/data';
import { merge } from './utils';

let orders = getOrders();

const orderHandlers = [
  http.get('/api/v1/order', async () => {
    await delay();
    return HttpResponse.json(orders);
  }),
  http.get('/api/v1/order/:id', async ({ params: { id } }) => {
    const item = orders.find(p => p.id === id);
    await delay();
    return item ? HttpResponse.json(item) : new HttpResponse(null, {
      status: 404,
      statusText: 'Order not found',
    });
  }),
  http.put('/api/v1/order', async ({ request }) => {
    const body = await request.json()
    if (!body) {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'No data',
      });
    }
    // Remove extra fields and generate id if required
    const { id = nanoid() , name } = body;
    const order = { id, name };

    orders = merge(orders, [order], (a, b) => a.id === b.id);
    await delay();
    saveOrders(orders);
    return HttpResponse.json(order, { status: 201 })
  }),
  /*
  http.put('/api/v1/order/:id', async ({ request, params }) => {
    const { id } = params
    const editedOrder = await request.json()
    delete editedOrder._isDirty;
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    orders[index] = editedOrder;
    saveOrders(orders);
    return HttpResponse.json(editedOrder)
  }),
  */
  http.delete('/api/v1/order/:id', async ({ params }) => {
    const { id } = params
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 })
    }
    const [deletedOrder] = orders.splice(index, 1)
    saveOrders(orders);
    await delay();
    return HttpResponse.json(deletedOrder)
  }),
]

export default orderHandlers;
