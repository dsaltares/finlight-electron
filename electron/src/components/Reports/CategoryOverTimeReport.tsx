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
import { useMemo } from 'react';
import { formatAmount } from '@lib/format';
import CategoryChip from '@components/CategoryChip';
import type { CategoryBucket } from '@server/reports/types';
import type { Category } from '@server/category/types';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import ChartContainer from './ChartContainer';
import { numberTypeToColor, type NumberType } from './utils';

type Props = {
  data: CategoryBucket[];
  currency: string;
  categories?: Category[];
  numberType?: NumberType;
};

export default function CategoryOverTimeReport({
  data,
  currency,
  categories,
  numberType,
}: Props) {
  const { filtersByField } = useFiltersFromUrl();
  const filteredCategoryIds = useMemo(
    () => new Set(filtersByField.categories?.split(',').map(Number)),
    [filtersByField.categories],
  );
  const categoriesInReport = useMemo(
    () => new Set(data?.map((datum) => Object.keys(datum.categories)).flat()),
    [data],
  );
  const selectedCategories = useMemo(
    () =>
      categories?.filter(
        (category) =>
          categoriesInReport.has(category.name) &&
          (filteredCategoryIds.size === 0 ||
            filteredCategoryIds.has(category.id)),
      ),
    [categories, filteredCategoryIds, categoriesInReport],
  );

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
              name={category.name}
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
                          color={numberTypeToColor(numberType)}
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
                        color={numberTypeToColor(numberType)}
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
