import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { orderApi } from '../services/order'
import { itemApi } from '../services/item'
import orderReducer from '../features/order/orderSlice'
import itemReducer from '../features/item/itemSlice'


export const store = configureStore({
  devTools: process.env.NODE_ENV === 'development',
  reducer: {
    [orderApi.reducerPath]: orderApi.reducer,
    [itemApi.reducerPath]: itemApi.reducer,
    order: orderReducer,
    item: itemReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(orderApi.middleware, itemApi.middleware),

});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)
