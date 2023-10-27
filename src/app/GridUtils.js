export const getEditedRowItem = (cellEditRequestEvent, setDirty = false) => {
  const { data, colDef: { field }, newValue } = cellEditRequestEvent;
  const editedItem = { ...data, [field]: newValue };
  if (setDirty) editedItem.__isDirty = true;
  return editedItem;
}
