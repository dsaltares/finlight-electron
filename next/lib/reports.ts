import type { ComponentType } from 'react';
import AccountBalancesReport from '@/components/reports/AccountBalancesReport';
import BalanceForecastReport from '@/components/reports/BalanceForecastReport';
import CategorizedExpensesOverTimeReport from '@/components/reports/CategorizedExpensesOverTimeReport';
import CategorizedExpensesReport from '@/components/reports/CategorizedExpensesReport';
import CategorizedIncomeOverTimeReport from '@/components/reports/CategorizedIncomeOverTimeReport';
import CategorizedIncomeReport from '@/components/reports/CategorizedIncomeReport';
import ExpensesVsBudgetReport from '@/components/reports/ExpensesVsBudgetReport';
import IncomeVsBudgetReport from '@/components/reports/IncomeVsBudgetReport';
import IncomeVsExpensesReport from '@/components/reports/IncomeVsExpensesReport';

type ReportDef = {
  key: string;
  label: string;
  Component: ComponentType<{ compact?: boolean }>;
};

export const reportGroups: ReportDef[][] = [
  [
    {
      key: 'categorizedExpenses',
      label: 'Where the money goes',
      Component: CategorizedExpensesReport,
    },
    {
      key: 'categorizedIncome',
      label: 'Where the money comes from',
      Component: CategorizedIncomeReport,
    },
  ],
  [
    {
      key: 'categorizedExpensesOverTime',
      label: 'Where the money goes over time',
      Component: CategorizedExpensesOverTimeReport,
    },
    {
      key: 'categorizedIncomeOverTime',
      label: 'Where the money comes from over time',
      Component: CategorizedIncomeOverTimeReport,
    },
  ],
  [
    {
      key: 'expensesVsBudget',
      label: 'Expenses vs budget over time',
      Component: ExpensesVsBudgetReport,
    },
    {
      key: 'incomeVsBudget',
      label: 'Income vs budget over time',
      Component: IncomeVsBudgetReport,
    },
  ],
  [
    {
      key: 'incomeVsExpenses',
      label: 'Income vs Expenses',
      Component: IncomeVsExpensesReport,
    },
  ],
  [
    {
      key: 'accountBalances',
      label: 'Account balances',
      Component: AccountBalancesReport,
    },
    {
      key: 'balanceForecast',
      label: 'Balance forecast',
      Component: BalanceForecastReport,
    },
  ],
];

export const allReports: Record<string, ReportDef> = Object.fromEntries(
  reportGroups.flat().map((r) => [r.key, r]),
);
