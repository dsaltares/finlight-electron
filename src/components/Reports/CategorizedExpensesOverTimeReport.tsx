import Stack from '@mui/material/Stack';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import stringToColor from 'string-to-color';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { formatAmount } from '@lib/format';
import type { TimeGranularity } from '@server/reports/types';
import getDateFilter from '@lib/getDateFilter';
import FullScreenSpinner from '@components/Layout/FullScreenSpinner';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import client from '@lib/client';
import CategoryChip from '@components/CategoryChip';
import ChartContainer from './ChartContainer';
import NoTransactionsFound from './NoTransactionsFound';

export default function CategorizedExpensesOverTimeReport() {
  const theme = useTheme();
  const { filtersByField } = useFiltersFromUrl();
  const { data, isLoading: isLoadingReport } =
    client.getBucketedCategoryReport.useQuery({
      type: 'Expense',
      date: getDateFilter(filtersByField),
      accounts: filtersByField.accounts?.split(',').map(Number),
      categories: filtersByField.categories?.split(',').map(Number),
      currency: filtersByField.currency,
      granularity: filtersByField.timeGranularity as TimeGranularity,
    });
  const { data: categories, isLoading: isLoadingCategories } =
    client.getCategories.useQuery();
  const currency = filtersByField.currency || 'EUR';
  const categoryIds = useMemo(
    () => new Set(filtersByField.categories?.split(',').map(Number)),
    [filtersByField.categories],
  );
  const selectedCategories = useMemo(() => {
    if (categoryIds.size === 0) {
      return categories;
    }
    return categories?.filter((category) => categoryIds.has(category.id));
  }, [categories, categoryIds]);

  if (isLoadingReport || isLoadingCategories) {
    return <FullScreenSpinner />;
  } else if (!data || data.length === 0) {
    return <NoTransactionsFound />;
  }

  return (
    <Stack gap={2} justifyContent="center">
      <ChartContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" />
          <YAxis />
          <Legend
            formatter={(_value, _entry, index) =>
              selectedCategories?.[index]?.name
            }
          />
          <Tooltip
            formatter={(value, _name, _props, index) => [
              formatAmount(value as number, currency),
              selectedCategories?.[index]?.name,
            ]}
            wrapperStyle={{ zIndex: 1 }}
          />
          {selectedCategories?.map((category) => (
            <Bar
              key={category.name}
              dataKey={(datum) => datum.categories[category.name] || 0}
              stackId="a"
              fill={stringToColor(category.name)}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <Stack>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  {selectedCategories?.map((category) => (
                    <TableCell key={category.id}>
                      <CategoryChip id={category.id} name={category.name} />
                    </TableCell>
                  ))}
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((datum) => (
                  <TableRow key={datum.bucket}>
                    <TableCell>{datum.bucket}</TableCell>
                    {selectedCategories?.map((category) => (
                      <TableCell key={category.id}>
                        <Typography
                          color={
                            datum.categories[category.name] > 0
                              ? theme.palette.error.main
                              : undefined
                          }
                          variant="inherit"
                        >
                          {formatAmount(
                            datum.categories[category.name],
                            currency,
                          )}
                        </Typography>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Typography
                        color={
                          datum.total > 0
                            ? theme.palette.error.main
                            : theme.palette.success.main
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
