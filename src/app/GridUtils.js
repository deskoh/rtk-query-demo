export const getEditedRowItem = (cellEditRequestEvent) => {
  const { data, colDef: { field }, newValue } = cellEditRequestEvent;
  const editedItem = { ...data, [field]: newValue };
  return editedItem;
}
