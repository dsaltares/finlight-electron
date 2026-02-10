import { format } from 'date-fns';

export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMMM yyyy');
}
