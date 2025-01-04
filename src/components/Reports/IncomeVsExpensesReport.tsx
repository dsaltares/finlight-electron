import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ChartContainer from '@components/Reports/ChartContainer';
import client from '@lib/client';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import { formatAmount } from '@lib/format';
import type { TimeGranularity } from '@server/reports/types';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import getDateFilter from '@lib/getDateFilter';
import NoTransactionsFound from './NoTransactionsFound';

export default function IncomeVsExpensesReport() {
  const theme = useTheme();
  const { filtersByField } = useFiltersFromUrl();
  const { data, isLoading } = client.getIncomeVsExpensesReport.useQuery({
    date: getDateFilter(filtersByField),
    accounts: filtersByField.accounts?.split(',').map(Number),
    currency: filtersByField.currency,
    granularity: filtersByField.timeGranularity as TimeGranularity,
    categories: filtersByField.categories?.split(',').map(Number),
  });

  if (isLoading) {
    return <FullScreenSpinner />;
  } else if (!data || data.length === 0) {
    return <NoTransactionsFound />;
  }

  const currency = filtersByField.currency || 'EUR';

  return (
    <Stack gap={2} justifyContent="center">
      <ChartContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" />
          <YAxis />
          <Tooltip
            formatter={(value) => formatAmount(value as number, currency)}
          />
          <Bar dataKey="income" fill={theme.palette.success.light} />
          <Bar dataKey="expenses" fill={theme.palette.error.light} />
        </BarChart>
      </ChartContainer>
      <Stack>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Income</TableCell>
                  <TableCell>Expenses</TableCell>
                  <TableCell>Difference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((datum) => (
                  <TableRow key={datum.bucket}>
                    <TableCell>{datum.bucket}</TableCell>
                    <TableCell>
                      <Typography color={'success.main'} variant="inherit">
                        {formatAmount(datum.income, currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color={'error.main'} variant="inherit">
                        {formatAmount(datum.expenses, currency)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={
                          datum.difference > 0 ? 'success.main' : 'error.main'
                        }
                        variant="inherit"
                      >
                        {formatAmount(datum.difference, currency)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </Stack>
  );
}
