import Grid from '@mui/material/Grid2';
import { Cell, Pie, PieChart } from 'recharts';
import stringToColor from 'string-to-color';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import type { GetCategoryReportOutput } from '@server/reports/types';
import { formatAmount } from '@lib/format';
import CategoryChip from '../CategoryChip';
import useIsMobile from '@lib/useIsMobile';
import ChartContainer from './ChartContainer';
import PieLabel from './PieLabel';

type NumberType = 'positive' | 'negative' | 'neutral';

type Props = {
  data: GetCategoryReportOutput;
  numberType?: NumberType;
  currency?: string;
};

export default function CategoryReport({
  data,
  numberType,
  currency = 'EUR',
}: Props) {
  const isMobile = useIsMobile();
  return (
    <Grid container rowGap={2} columnSpacing={2} justifyContent="center">
      <Grid size={{ xs: 12, md: 8 }}>
        <ChartContainer>
          <PieChart>
            <Pie
              data={data.categories}
              cx="50%"
              cy="50%"
              dataKey="value"
              outerRadius="60%"
              labelLine={!isMobile}
              label={(props) => <PieLabel {...props} />}
            >
              {data.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={stringToColor(entry.name)} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>
                    <Typography
                      color={numberTypeToColor(numberType)}
                      variant="inherit"
                    >
                      {formatAmount(data.total, currency)}
                    </Typography>
                  </TableCell>
                </TableRow>
                {data.categories.map((datum) => (
                  <TableRow key={datum.id}>
                    <TableCell>
                      <CategoryChip id={datum.id} name={datum.name} />
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={numberTypeToColor(numberType)}
                        variant="inherit"
                      >
                        {formatAmount(datum.value, currency)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

function numberTypeToColor(numberType: NumberType = 'neutral') {
  switch (numberType) {
    case 'positive':
      return 'success.main';
    case 'negative':
      return 'error';
    default:
      return 'inherit';
  }
}
