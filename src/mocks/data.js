import { nanoid } from 'nanoid';

const orders = [
  { id: nanoid(), name: 'order1' },
  { id: nanoid(), name: 'order2' },
  { id: nanoid(), name: 'order3' }
];

// Store reference to item to easily notify order when items modified
// Storing items ID array in order could result in dangling items when DB operations has errors
const items = [
  { id: nanoid(), name: 'item1', _orderId: orders[1].id },
  { id: nanoid(), name: 'item2', _orderId: orders[1].id },
  { id: nanoid(), name: 'item3', _orderId: orders[2].id },
  { id: nanoid(), name: 'item4', _orderId: orders[2].id },
  { id: nanoid(), name: 'item5', _orderId: orders[2].id },
];

export const saveOrders = (orders) => localStorage.setItem('order', JSON.stringify(orders))
export const saveItems = (items) => localStorage.setItem('item', JSON.stringify(items))

if (!localStorage.getItem('order')) {
  localStorage.setItem('order', JSON.stringify(orders))
}

if (!localStorage.getItem('item')) {
  localStorage.setItem('item', JSON.stringify(items))
}

export const getOrders = () => JSON.parse(localStorage.getItem('order'));
export const getItems = () => JSON.parse(localStorage.getItem('item'));



