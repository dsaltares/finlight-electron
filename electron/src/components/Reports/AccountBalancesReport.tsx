import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
import stringToColor from 'string-to-color';
import { Link } from 'react-router-dom';
import ChartContainer from '@components/Reports/ChartContainer';
import client from '@lib/client';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import { formatAmount } from '@lib/format';
import type { TimeGranularity } from '@server/reports/types';
import Routes from '@lib/routes';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import getDateFilter from '@lib/getDateFilter';
import type { Account } from '@server/accounts/types';
import NoTransactionsFound from './NoTransactionsFound';

export default function AccountBalancesReport() {
  const theme = useTheme();
  const { filtersByField } = useFiltersFromUrl();
  const { data, isLoading } = client.getAccountBalancesReport.useQuery({
    date: getDateFilter(filtersByField),
    accounts: filtersByField.accounts?.split(',').map(Number),
    currency: filtersByField.currency,
    granularity: filtersByField.timeGranularity as TimeGranularity,
  });
  const { data: accounts } = client.getAccounts.useQuery();
  const accountsByName = useMemo(
    () =>
      accounts?.accounts.reduce<Record<string, Account | undefined>>(
        (acc, account) => ({ ...acc, [account.name]: account }),
        {},
      ) || {},
    [accounts],
  );

  if (isLoading) {
    return <FullScreenSpinner />;
  } else if (!data || data.length === 0) {
    return <NoTransactionsFound />;
  }

  const accountNames =
    data && data.length > 0 ? Object.keys(data[0].positions) : [];
  const currency = filtersByField.currency || 'EUR';

  return (
    <Stack gap={2} justifyContent="center">
      <ChartContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" />
          <YAxis />
          <Legend />
          <Tooltip
            formatter={(value) => formatAmount(value as number, currency)}
          />
          {accountNames.map((name) => (
            <Line
              key={name}
              dataKey={(datum) => datum.positions[name]}
              name={name}
              stroke={stringToColor(name)}
            />
          ))}
          <Line
            key="Total"
            dataKey="total"
            name="Total"
            stroke={stringToColor('Total')}
          />
        </LineChart>
      </ChartContainer>
      <Stack>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  {accountNames.map((name) => (
                    <TableCell key={name}>
                      <Link
                        to={
                          accountsByName[name]?.id
                            ? Routes.transactionsForAccount(
                                accountsByName[name]?.id,
                              )
                            : Routes.recentTransactions
                        }
                      >
                        {name}
                      </Link>
                    </TableCell>
                  ))}
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((datum) => (
                  <TableRow key={datum.bucket}>
                    <TableCell>{datum.bucket}</TableCell>
                    {accountNames.map((name) => (
                      <TableCell key={name}>
                        <Typography
                          color={
                            datum.positions[name] > 0
                              ? theme.palette.success.main
                              : theme.palette.error.main
                          }
                          variant="inherit"
                        >
                          {formatAmount(datum.positions[name], currency)}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Typography
                        color={
                          datum.total > 0
                            ? theme.palette.success.main
                            : theme.palette.error.main
                        }
                        variant="inherit"
                      >
                        {formatAmount(datum.total, currency)}
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
