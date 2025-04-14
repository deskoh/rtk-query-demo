import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { api } from './features/api/apiSlice';

let store;

const getStore = (initialState = {}) => {
  const rootReducer = combineReducers({
    [api.reducerPath]: api.reducer,
  });

  const newStore = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: initialState
  });

  setupListeners(newStore.dispatch);

  return newStore;
};



const setupStore = (initialState) => {
  store = getStore(initialState);
  return store;
};

const resetStore = () => store = getStore();

export { setupStore, resetStore };
