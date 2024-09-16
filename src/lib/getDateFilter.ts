import type { DateFilter } from '@server/types';
import { isDateRange, isPeriod } from '@server/types';
import type { FiltersByField } from './useFiltersFromUrl';

export default function getDateFilter(
  filters: FiltersByField,
): DateFilter | undefined {
  if (isPeriod(filters.period)) {
    return filters.period;
  }
  const range = {
    from: filters.from,
    until: filters.until,
  };
  if (isDateRange(range)) {
    return range;
  }
}
