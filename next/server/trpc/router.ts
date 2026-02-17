import categoriesRouter from './procedures/categories';
import exchangeRatesRouter from './procedures/exchangeRates';
import importPresetsRouter from './procedures/importPresets';
import { router } from './trpc';

export const appRouter = router({
  exchangeRates: exchangeRatesRouter,
  importPresets: importPresetsRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;
