/**
 * Merge array b into a.
 * @param {*} a 
 * @param {*} b 
 * @returns 
 */
export const merge = (a, b, predicate = (a, b) => a === b) => {
  const c = [];
  // copy items from A if they're not present in B, else copy B
  a.forEach((aItem) => c.push(b.find(bItem => predicate(aItem, bItem)) || aItem))
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(cItem, bItem)) ? null : c.push(bItem)))
  return c;
}

// Similar to merge but keep dirty items in a
export const mergeRetainDirty = (a, b, predicate = (a, b) => a === b) => {
  const c = [];
  // copy items from A if they're not present in B, else copy B
  a.forEach((aItem) => {
    const newerAItem = b.find(bItem => predicate(aItem, bItem));
    c.push(aItem.__isDirty ? aItem : newerAItem)
  });
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => predicate(cItem, bItem)) ? null : c.push(bItem)))
  return c;
}
