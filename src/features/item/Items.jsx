import { useCallback, useRef } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";

// import { useSelectedItem } from "./itemApi";
import { selectItemId, clearSelectedItemId } from "./itemSlice";

import {
  itemApi,
  useGetOrderItemsQuery,
  editOrderItemAction,
  addOrderItemAction,
  clearOrderItemsAction,
} from "features/item/itemApi";
import { useSelectedOrder } from "features/order/orderSlice";
import { getEditedRowItem } from "app/GridUtils";
import ItemCellRenderer from "./ItemCellRenderer";

const columnDefs = [
  { field: "id", cellRenderer: "agGroupCellRenderer" },
  { field: "name", editable: true, sortable: true },
  { headerName: "Actions", cellRenderer: ItemCellRenderer },
];

const Items = () => {
  const gridRef = useRef();
  const dispatch = useDispatch();

  const { data: selectedOrder } = useSelectedOrder();
  // TODO: this will change when selected item id change?
  const { data: items } = useGetOrderItemsQuery(selectedOrder);
  // const selectedItem = useSelectedItem();

  const onCellEditRequest = useCallback(
    (event) => {
      const editedItem = getEditedRowItem(event, true);
      dispatch(editOrderItemAction(selectedOrder.id, editedItem));
    },
    [dispatch, selectedOrder?.id]
  );

  const onDetailCellEditRequest = useCallback(
    async ({ context: staleItem }) => {
      // TODO: item is stale
      const promise = dispatch(
        itemApi.endpoints.searchItems.initiate({ orderId: selectedOrder.id })
      );
      const { data: items } = await promise;
      promise.unsubscribe();
      const item = items.find((i) => i.id === staleItem.id);
      console.log(
        "!onDetailCellEditRequest selectedOrder",
        selectedOrder,
        "!onDetailCellEditRequest selectedOrder",
        item,
        "!onDetailCellEditRequest selectedOrder",
        staleItem
      );
      // adding selectedItem to deps array will cause single-click edit to exit editing immediately on item selection changed
    },
    [dispatch, selectedOrder]
  );

  const addOrderItem = useCallback(() => {
    const newItem = {
      id: nanoid(),
      name: "new item",
      details: [{ description: "some description" }],
      _orderId: selectedOrder.id,
    };
    dispatch(addOrderItemAction(selectedOrder.id, newItem));
  }, [dispatch, selectedOrder]);

  const clearItems = useCallback(() => {
    dispatch(clearOrderItemsAction(selectedOrder.id));
  }, [dispatch, selectedOrder]);

  const detailCellRendererParams = useCallback(
    (params) => {
      return {
        // provide the Grid Options to use on the Detail Grid
        detailGridOptions: {
          columnDefs: [{ field: "description", editable: true }],
          readOnlyEdit: true,
          singleClickEdit: true,
          onCellEditRequest: onDetailCellEditRequest,
          context: params.data,
        },
        // get the rows for each Detail Grid
        getDetailRowData: (params) => {
          params.successCallback(params.data.details);
        },
      };
    },
    [onDetailCellEditRequest]
  );

  const onSelectionChanged = useCallback(
    (event) => {
      const [selectedItem] = gridRef.current.api.getSelectedRows();
      if (selectedItem) {
        dispatch(selectItemId(selectedItem.id));
      } else {
        dispatch(clearSelectedItemId());
      }
    },
    [dispatch]
  );

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: "4px" }}>
          <button onClick={() => addOrderItem()} disabled={!selectedOrder}>
            Add Item
          </button>
          <button onClick={clearItems}>Clear Data</button>
        </div>
        <div className="ag-theme-alpine" style={{ flexGrow: "1" }}>
          <AgGridReact
            ref={gridRef}
            getRowId={(params) => params.data.id}
            rowData={items}
            columnDefs={columnDefs}
            animateRows={true}
            // Set readOnlyEdit to true to fire onCellEditRequest as rowData is immutable
            readOnlyEdit
            singleClickEdit
            onCellEditRequest={onCellEditRequest}
            rowSelection={"single"}
            onSelectionChanged={onSelectionChanged}
            masterDetail
            detailCellRendererParams={detailCellRendererParams}
          />
        </div>
      </div>
    </div>
  );
};

export default Items;
