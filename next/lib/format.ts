import { format } from 'date-fns';

export function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMMM yyyy');
}

export function formatDateWithGranularity(
  date: Date | string,
  granularity: string,
) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const fmt =
    granularity === 'Daily'
      ? 'dd MMMM yyyy'
      : granularity === 'Monthly'
        ? 'MMMM yyyy'
        : granularity === 'Quarterly'
          ? 'qqq yyyy'
          : 'yyyy';
  return format(d, fmt);
}

export function formatCurrencyValue(value: number) {
  return value.toFixed(4);
}

export function formatPercentage(value: number) {
  if (!Number.isFinite(value)) return '-';
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatAmount(
  amountInCents: number,
  currency: string | undefined,
) {
  if (Number.isNaN(amountInCents)) {
    return '-';
  }

  const amount = amountInCents / 100;
  const safeAmount = Object.is(amount, -0) ? 0 : amount;

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${safeAmount.toFixed(2)} ${currency || 'EUR'}`;
  }
}
