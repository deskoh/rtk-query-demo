import { useSelector } from 'react-redux';
/**
 * Called when query results returned or cache mutated manually to recalculate tags
 */
export function providesList(resultsWithIds = [], tagType) {
  return [
    { type: tagType, id: 'LIST' },
    ...resultsWithIds.map(({ id }) => ({ type: tagType, id })),
  ];
}

export function providesId(resultsWithId, id, tagType) {
  return resultsWithId
    ? [{ type: tagType, id }]
    : ['NOT_FOUND']
}

export const useIsLoading = () => useSelector(
  state => Object.values(state.api.queries)
    .some(query => query.status === 'pending')
);
