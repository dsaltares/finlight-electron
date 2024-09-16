import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import ChartContainer from '@components/Reports/ChartContainer';
import client from '@lib/client';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import { formatAmount } from '@lib/format';
import type { TimeGranularity } from '@server/reports/types';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import getDateFilter from '@lib/getDateFilter';
import NoTransactionsFound from './NoTransactionsFound';

export default function BalanceForecastReport() {
  const theme = useTheme();
  const { filtersByField } = useFiltersFromUrl();
  const { data, isLoading } = client.getBalanceForecastReport.useQuery({
    date: getDateFilter(filtersByField),
    accounts: filtersByField.accounts?.split(',').map(Number),
    currency: filtersByField.currency,
    granularity: filtersByField.timeGranularity as TimeGranularity,
  });
  const currency = filtersByField.currency || 'EUR';

  if (isLoading) {
    return <FullScreenSpinner />;
  } else if (!data || data.length === 0) {
    return <NoTransactionsFound />;
  }

  return (
    <ChartContainer>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bucket" />
        <YAxis />
        <Legend />
        <Tooltip
          formatter={(value) => formatAmount(value as number, currency)}
        />
        <Area
          dataKey="forecast"
          name="Forecast"
          stroke={theme.palette.secondary.dark}
          fill={theme.palette.secondary.light}
          strokeDasharray="3 3"
        />
        <Bar
          name="Balance"
          dataKey="balance"
          barSize={20}
          stroke={theme.palette.primary.dark}
          fill={theme.palette.primary.light}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
