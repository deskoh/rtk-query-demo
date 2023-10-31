import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { api } from 'features/api/apiSlice';
import orderReducer from 'features/order/orderSlice';
import itemReducer from 'features/item/itemSlice';


export const store = configureStore({
  devTools: process.env.NODE_ENV === 'development',
  reducer: {
    [api.reducerPath]: api.reducer,
    order: orderReducer,
    item: itemReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),

});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)
