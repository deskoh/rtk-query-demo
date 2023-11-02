
export const setupSocketEventHandler = (ws, updateCachedData) => {
  const listener = event => {
    const message = JSON.parse(event.data)
    console.log('message received', event.data);
    switch (message.topic) {
      case 'order/upsert':
        updateCachedData(draft => {
          const index = draft.findIndex(o => o.id === message.payload.id);
          if (index > -1) {
            if (draft[index].__isDirty) {
              console.log('Server update conflict detected', message.payload);
            } else {
              console.log('Server update merged', message.payload)
              draft[index] = message.payload;
            }
          } else {
            console.log('Server create added', message.payload)
            draft.push(message.payload)
          }
        })
        break;
      case 'order/delete':
        updateCachedData(draft => {
          const index = draft.findIndex(o => o.id === message.payload);
          if (index > -1) {
            if (draft[index].__isDirty) {
              console.log('Server delete conflict', message.payload)
            } else {
              console.log('Server delete', message.payload)
              draft.splice(index, 1);
            }
          } else {
            console.log('server delete not found', message.payload);
          }
        });
        break;
      default:
        break;
    }
  }
  ws.addEventListener('message', listener);
}



export default setupSocketEventHandler;
