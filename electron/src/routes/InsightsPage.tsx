import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TuneIcon from '@mui/icons-material/Tune';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { Helmet } from 'react-helmet';
import CategorizedExpensesReport from '@components/Reports/CategorizedExpensesReport';
import CategorizedIncomeReport from '@components/Reports/CategorizedIncomeReport';
import IncomeVsExpensesReport from '@components/Reports/IncomeVsExpensesReport';
import AccountBalancesReport from '@components/Reports/AccountBalancesReport';
import BalanceForecastReport from '@components/Reports/BalanceForecastReport';
import CategorizedExpensesOverTimeReport from '@components/Reports/CategorizedExpensesOverTimeReport';
import CategorizedIncomeOverTimeReport from '@components/Reports/CategorizedIncomeOverTimeReport';
import AppName from '@lib/appName';
import client from '@lib/client';
import useFiltersFromUrl from '@lib/useFiltersFromUrl';
import useDialog from '@components/useDialog';
import ReportSettingsDialog from '@components/Reports/ReportSettingsDialog';
import ReportSettingsChips from '@components/Reports/ReportSettingsChips';

const Reports = {
  categorizedExpenses: {
    name: 'Where the money goes',
    Component: CategorizedExpensesReport,
  },
  categorizedIncome: {
    name: 'Where the money comes from',
    Component: CategorizedIncomeReport,
  },
  categorizedExpensesOverTime: {
    name: 'Where the money goes over time',
    Component: CategorizedExpensesOverTimeReport,
  },
  categorizedIncomeOverTime: {
    name: 'Where the money comes from over time',
    Component: CategorizedIncomeOverTimeReport,
  },
  incomeVsExpenses: {
    name: 'Income vs Expenses',
    Component: IncomeVsExpensesReport,
  },
  accountBalances: {
    name: 'Account balances',
    Component: AccountBalancesReport,
  },
  balanceForecast: {
    name: 'Balance forecast',
    Component: BalanceForecastReport,
  },
};

type Report = keyof typeof Reports;

export default function InsightsPage() {
  const {
    open: isSettingsDialogOpen,
    onOpen: onSettingsDialogOpen,
    onClose: onSettingsDialogClose,
  } = useDialog();
  const { filtersByField, setFilters } = useFiltersFromUrl();
  const { data: accounts } = client.getAccounts.useQuery();
  const { data: categories } = client.getCategories.useQuery();
  const numFilters = Object.keys(filtersByField).filter(
    (field) => field !== 'report',
  ).length;
  const report: Report =
    filtersByField.report &&
    Object.prototype.hasOwnProperty.call(Reports, filtersByField.report)
      ? (filtersByField.report as Report)
      : 'categorizedExpenses';
  const ReportComponent = Reports[report].Component;
  return (
    <>
      <Helmet>
        <title>{`Insights - ${AppName}`}</title>
      </Helmet>
      <Stack gap={2} height="100%">
        <Stack direction="row" gap={1} alignItems="center">
          <FormControl fullWidth>
            <InputLabel id="select-report-label">Report</InputLabel>
            <Select
              label="Report"
              id="select-report"
              labelId="select-report-label"
              value={report}
              onChange={(e) => setFilters({ report: e.target.value })}
            >
              {Object.entries(Reports).map(([value, { name }]) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack>
            <Badge badgeContent={numFilters} color="secondary">
              <IconButton color="primary" onClick={onSettingsDialogOpen}>
                <TuneIcon />
              </IconButton>
            </Badge>
          </Stack>
        </Stack>
        <ReportSettingsChips />
        <ReportComponent />
        {isSettingsDialogOpen && (
          <ReportSettingsDialog
            open={isSettingsDialogOpen}
            onClose={onSettingsDialogClose}
            accounts={accounts?.accounts || []}
            categories={categories || []}
          />
        )}
      </Stack>
    </>
  );
}
