import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { nanoid } from "@reduxjs/toolkit";

import {
  useGetOrderItemsQuery,
  editOrderItemAction,
  addOrderItemAction,
  clearOrderItemsAction,
} from 'features/item/itemApi';
import { useSelectedOrder } from 'features/order/orderSlice';
import { getEditedRowItem } from 'app/GridUtils';
import ItemCellRenderer from "./ItemCellRenderer";

const columnDefs = [
  { field: "id" },
  { field: "name", editable: true, sortable: true },
  { headerName: "Actions", cellRenderer: ItemCellRenderer },
];

const Items = () => {
  const gridRef = useRef();
  const dispatch = useDispatch();

  const { data: selectedOrder } = useSelectedOrder();
  const { data: items } = useGetOrderItemsQuery(selectedOrder?.id);

  const onCellEditRequest = useCallback((event) => {
    const editedItem = getEditedRowItem(event, true);
    dispatch(editOrderItemAction(selectedOrder.id, editedItem));
  }, [dispatch, selectedOrder?.id]);

  const addOrderItem = useCallback(() => {
    const newItem = { id: nanoid(), name: 'new item', _orderId: selectedOrder.id };
    dispatch(addOrderItemAction(selectedOrder.id, newItem));
  }, [dispatch, selectedOrder]);

  const clearItems = useCallback(() => {
    dispatch(clearOrderItemsAction(selectedOrder.id));
  }, [dispatch, selectedOrder]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '4px' }}>
          <button onClick={() => addOrderItem()} disabled={!selectedOrder}>Add Item</button>
          <button onClick={clearItems}>Clear Data</button>
        </div>
        <div className="ag-theme-alpine" style={{ flexGrow: '1' }}>
          <AgGridReact
            ref={gridRef}
            getRowId={(params) => params.data.id}
            rowData={items}
            columnDefs={columnDefs}
            animateRows={true}
            // Set readOnlyEdit to true to fire onCellEditRequest as rowData is immutable
            readOnlyEdit={true}
            onCellEditRequest={onCellEditRequest}
            rowSelection={'multiple'}
            />
        </div>
      </div>
    </div>
  );
};

export default Items;
