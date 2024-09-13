import { format } from 'date-fns/format';
import createUTCDate from '@lib/createUTCDate';
import type { TimeGranularity } from '@server/reports/types';

export function formatDate(date: Date | string) {
  return format(createUTCDate(date), 'dd MMMM yyyy');
}

export function formatDateWithGranularity(
  date: Date | string,
  granularity: TimeGranularity,
) {
  const formatString =
    granularity === 'Daily'
      ? 'dd MMMM yyyy'
      : granularity === 'Monthly'
        ? 'MMMM yyyy'
        : granularity === 'Quarterly'
          ? 'qqq yyyy'
          : 'yyyy';
  return format(createUTCDate(date), formatString);
}

export function formatAmount(amount: number, currency: string | undefined) {
  return isNaN(amount)
    ? '-'
    : new Intl.NumberFormat('en-UK', {
        style: 'currency',
        currency: currency || 'EUR',
      })
        .format(parseFloat(amount.toString().replace('-0', '0')))
        .replace('-0', '0');
}

export function formatPercentage(percentage: number) {
  return `${(percentage * 100).toFixed(2)}%`;
}
