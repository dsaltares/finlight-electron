import type {
  ColumnSort,
  OnChangeFn,
  SortingState,
} from '@tanstack/react-table';
import { parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

export default function useSortFromUrl(
  defaultSort: ColumnSort | undefined = undefined,
) {
  const [state, setState] = useQueryStates({
    sortBy: parseAsString,
    sortDir: parseAsString,
  });

  const { sortBy, sortDir } = state;

  const sorting: ColumnSort[] = useMemo(() => {
    if (sortBy) {
      return [{ id: sortBy, desc: sortDir === 'desc' }];
    }
    return defaultSort ? [defaultSort] : [];
  }, [sortBy, sortDir, defaultSort]);

  const toggleSort = useCallback(
    (id: string) => {
      const currentSortBy = sortBy ?? defaultSort?.id ?? null;
      const currentSortDir = sortDir ?? (defaultSort?.desc ? 'desc' : 'asc');

      if (currentSortBy === id && currentSortDir === 'desc') {
        setState({ sortBy: id, sortDir: 'asc' });
      } else if (currentSortBy === id && currentSortDir === 'asc') {
        setState({ sortBy: null, sortDir: null });
      } else {
        setState({ sortBy: id, sortDir: 'desc' });
      }
    },
    [sortBy, sortDir, defaultSort, setState],
  );

  const onSortingChange: OnChangeFn<SortingState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const first = next[0];
      setState({
        sortBy: first?.id ?? null,
        sortDir: first?.desc ? 'desc' : first ? 'asc' : null,
      });
    },
    [sorting, setState],
  );

  return {
    sorting,
    toggleSort,
    onSortingChange,
  };
}
