import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

import { useGetOrderByIdQuery } from "./orderApi";

const initialState = {
  // Avoid using selectedOrder as order could be mutated in cache
  selectedOrderId: undefined,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    // Store Id instead of actual order since it is immutable and will be stale when order in cache is updated.
    selectOrderId: (state, action) => {
      state.selectedOrderId = action.payload;
    },
    clearSelectedOrderId: (state) => {
      state.selectedOrderId = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { selectOrder, selectOrderId, clearSelectedOrderId } =
  orderSlice.actions;

export default orderSlice.reducer;

// Custom hook
export const useSelectedOrder = () => {
  const selectedOrderId = useSelector((state) => state.order.selectedOrderId);
  return useGetOrderByIdQuery(selectedOrderId);
};
