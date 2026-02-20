import accountsRouter from './procedures/accounts';
import categoriesRouter from './procedures/categories';
import exchangeRatesRouter from './procedures/exchangeRates';
import importPresetsRouter from './procedures/importPresets';
import transactionsRouter from './procedures/transactions';
import userSettingsRouter from './procedures/userSettings';
import { router } from './trpc';

export const appRouter = router({
  accounts: accountsRouter,
  exchangeRates: exchangeRatesRouter,
  importPresets: importPresetsRouter,
  categories: categoriesRouter,
  transactions: transactionsRouter,
  userSettings: userSettingsRouter,
});

export type AppRouter = typeof appRouter;
