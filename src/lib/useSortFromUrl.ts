import type { ColumnSort } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function useSortFromUrl(
  defaultSort: ColumnSort | undefined = undefined,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasSort = searchParams.has('sortBy');
  const sortBy = searchParams.get('sortBy');
  const sortDir = searchParams.get('sortDir');
  const sorting: ColumnSort[] = useMemo(() => {
    if (hasSort) {
      return sortBy ? [{ id: sortBy, desc: sortDir === 'desc' }] : [];
    }
    return defaultSort ? [defaultSort] : [];
  }, [sortBy, sortDir, defaultSort, hasSort]);
  const toggleSort = useCallback(
    (id: string) => {
      const currentSortBy = sortBy ?? defaultSort?.id;
      const currentSortDir = sortDir ?? (defaultSort?.desc ? 'desc' : 'asc');
      const newQuery = new URLSearchParams(searchParams);

      if (currentSortBy === id && currentSortDir === 'desc') {
        newQuery.set('sortBy', id);
        newQuery.set('sortDir', 'asc');
      } else if (currentSortBy === id && currentSortDir === 'asc') {
        newQuery.delete('sortBy');
        newQuery.delete('sortDir');
      } else {
        newQuery.set('sortBy', id);
        newQuery.set('sortDir', 'desc');
      }

      setSearchParams(newQuery);
    },
    [setSearchParams, sortBy, sortDir, defaultSort],
  );
  return {
    sorting,
    toggleSort,
  };
}
