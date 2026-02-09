import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type FiltersByField = Record<string, string | undefined>;

export default function useFiltersFromUrl() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () =>
      [...searchParams.keys()]
        .filter((key) => key.startsWith('filterBy'))
        .map((key) => {
          const id = key.split('filterBy')[1];
          return {
            id: id[0].toLowerCase() + id.slice(1),
            value: searchParams.get(key) as string,
          };
        }),
    [searchParams],
  );
  const filtersByField = useMemo(
    () =>
      filters.reduce<FiltersByField>(
        (acc, filter) => ({ ...acc, [filter.id]: filter.value }),
        {},
      ),
    [filters],
  );
  const setFilters = useCallback(
    (filters: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const newQuery = new URLSearchParams(prev);
        Object.keys(filters).forEach((id) => {
          const field = `filterBy${id[0].toUpperCase()}${id.slice(1)}`;
          newQuery.set(field, filters[id] || '');
          if (!filters[id]) {
            newQuery.delete(field);
          }
        });
        return newQuery;
      });
    },
    [filters, setSearchParams],
  );

  return {
    filters,
    filtersByField,
    setFilters,
    hasFilters: filters.length > 0,
  };
}
