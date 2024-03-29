import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const initialState = {
  initialOrderItemIds: {},
};

export const itemSlice = createSlice({
  name: "item",
  initialState,
  reducers: {
    saveInitialOrderItemIds: (state, action) => {
      const { orderId, itemIds } = action.payload;
      state.initialOrderItemIds[orderId] = itemIds;
    },
    clearInitialOrderItemIds: (state, action) => {
      const orderId = action.payload;
      delete state.initialOrderItemIds[orderId];
    },
    selectItemId: (state, action) => {
      state.selectedItemId = action.payload;
    },
    clearSelectedItemId: (state) => {
      state.selectedItemId = undefined;
    },
  },
});

export const {
  saveInitialOrderItemIds,
  clearOrderItemIds,
  selectItemId,
  clearSelectedItemId,
} = itemSlice.actions;

export default itemSlice.reducer;

// Custom hook
export const useInitialOrderItemIds = (orderId) =>
  useSelector((state) => state.item.initialOrderItemIds[orderId]);
