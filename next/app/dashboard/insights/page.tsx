'use client';

import { IconAdjustments } from '@tabler/icons-react';
import { Suspense } from 'react';
import AccountBalancesReport from '@/components/reports/AccountBalancesReport';
import BalanceForecastReport from '@/components/reports/BalanceForecastReport';
import CategorizedExpensesOverTimeReport from '@/components/reports/CategorizedExpensesOverTimeReport';
import CategorizedExpensesReport from '@/components/reports/CategorizedExpensesReport';
import CategorizedIncomeOverTimeReport from '@/components/reports/CategorizedIncomeOverTimeReport';
import CategorizedIncomeReport from '@/components/reports/CategorizedIncomeReport';
import IncomeVsExpensesReport from '@/components/reports/IncomeVsExpensesReport';
import ReportSettingsChips from '@/components/reports/ReportSettingsChips';
import ReportSettingsDialog from '@/components/reports/ReportSettingsDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useDialog from '@/hooks/use-dialog';
import useInsightsFilters from '@/hooks/useInsightsFilters';

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
} as const;

type ReportKey = keyof typeof Reports;

export default function InsightsPage() {
  const {
    open: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDialog();
  const { report, setReport, filterCount } = useInsightsFilters();

  const reportKey = (
    report in Reports ? report : 'categorizedExpenses'
  ) as ReportKey;
  const ReportComponent = Reports[reportKey].Component;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex shrink-0 flex-row items-center gap-2">
        <Select value={reportKey} onValueChange={setReport}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(Reports).map(([key, { name }]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsOpen}
          className="relative"
        >
          <IconAdjustments className="size-5" />
          {filterCount > 0 && (
            <Badge className="absolute -top-1 -right-1 size-5 p-0 text-[10px]">
              {filterCount}
            </Badge>
          )}
        </Button>
      </div>

      <ReportSettingsChips />

      <div className="flex-1 min-h-0">
        <Suspense>
          <ReportComponent />
        </Suspense>
      </div>

      {isSettingsOpen && (
        <ReportSettingsDialog open={isSettingsOpen} onClose={onSettingsClose} />
      )}
    </div>
  );
}
