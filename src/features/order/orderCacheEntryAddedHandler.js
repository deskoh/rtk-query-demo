async function onCacheEntryAdded(
  arg,
  { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
) {
  // create a websocket connection when the cache subscription starts
  const ws = new WebSocket('ws://localhost')
  try {
    // wait for the initial query to resolve before proceeding
    await cacheDataLoaded

    // when data is received from the socket connection to the server,
    // update our query result with the received message
    const listener = event => {
      const message = JSON.parse(event.data)
      console.log('message received', event.data);
      switch (message.topic) {
        case 'order/create': {
          updateCachedData(draft => {
            draft.push(message.payload)
          })
          break
        }
        default:
          break
      }
    }

    ws.addEventListener('message', listener)
  } catch {
    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
    // in which case `cacheDataLoaded` will throw
  }
  // cacheEntryRemoved will resolve when the cache subscription is no longer active
  await cacheEntryRemoved
  // perform cleanup steps once the `cacheEntryRemoved` promise resolves
  ws.close()
}

export default onCacheEntryAdded
