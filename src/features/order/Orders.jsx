import { nanoid } from "@reduxjs/toolkit";
import { useCallback, useRef } from "react";
import { useDispatch } from "react-redux";
import { AgGridReact } from "ag-grid-react";

import { useGetOrdersQuery, updateOrderAction, useUpsertOrderMutation, orderApi } from 'features/order/orderApi';
import { getEditedRowItem } from 'app/GridUtils';
import { selectOrderId, clearSelectedOrderId } from './orderSlice';
import OrderCellRenderer from "./OrderCellRenderer";

const columnDefs = [
  { field: "id" },
  { field: "name", editable: true, sortable: true },
  { field: "itemsCount", sortable: true },
  { headerName: "Save", cellRenderer: OrderCellRenderer },
];

const rowSelection = {
  mode: "singleRow",
  checkboxes: false,
  enableClickSelection: true,
};

const Orders = () => {
  const gridRef = useRef();
  const dispatch = useDispatch();
  const { data } = useGetOrdersQuery();
  const [upsertOrder] = useUpsertOrderMutation();
  const onCellEditRequest = useCallback((event) => {
    const editedOrder = getEditedRowItem(event, true);
    dispatch(updateOrderAction(editedOrder.id, editedOrder));;
  }, [dispatch]);

  const onSelectionChanged = useCallback(() => {
    const [selectedOrder] = gridRef.current.api.getSelectedRows();
    if (selectedOrder) {
      dispatch(selectOrderId(selectedOrder.id));
    } else {
      dispatch(clearSelectedOrderId());
    }
  }, [dispatch]);

  const addOrderHandler = useCallback(async () => {
    // Order will be persisted, no need to set dirty flag
    const newOrder = { id: nanoid(), name: 'new order' };
    try {
      await upsertOrder(newOrder).unwrap();
    } catch (e) {
      console.error(e);
    }
  }, [upsertOrder]);

  const test = () => {
    dispatch(orderApi.endpoints.searchItemsBatch.initiate({ orderIds: ['ri6CHMGrjxpxN4dkO0g24', 'bq9oe9MrLaNA5PSgqTC8h'] }));
  }

  return (
    <div style={{ height: '200px', width: '100%' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '4px' }}>
          <button onClick={() => addOrderHandler()}>Add Order</button>
          <button onClick={() => test()}>Test Batch</button>
        </div>
        <div className="ag-theme-alpine" style={{ height: '100%' }}>
          <AgGridReact
            ref={gridRef}
            getRowId={(params) => params.data.id}
            rowData={data}
            columnDefs={columnDefs}
            // Set readOnlyEdit to true to fire onCellEditRequest as rowData is immutable
            readOnlyEdit={true}
            onCellEditRequest={onCellEditRequest}
            // Enable single row selection
            rowSelection={rowSelection}
            onSelectionChanged={onSelectionChanged}

            // onRowValueChanged={onRowValueChanged}
            editType={"fullRow"}
          / >
        </div>
      </div>
    </div>
  );
};

export default Orders;
