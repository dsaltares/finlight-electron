import accountsRouter from './procedures/accounts';
import budgetRouter from './procedures/budget';
import categoriesRouter from './procedures/categories';
import exchangeRatesRouter from './procedures/exchangeRates';
import importPresetsRouter from './procedures/importPresets';
import reportsRouter from './procedures/reports';
import transactionsRouter from './procedures/transactions';
import userSettingsRouter from './procedures/userSettings';
import { router } from './trpc';

export const appRouter = router({
  accounts: accountsRouter,
  budget: budgetRouter,
  exchangeRates: exchangeRatesRouter,
  importPresets: importPresetsRouter,
  categories: categoriesRouter,
  reports: reportsRouter,
  transactions: transactionsRouter,
  userSettings: userSettingsRouter,
});

export type AppRouter = typeof appRouter;
