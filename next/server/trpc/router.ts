import exchangeRatesRouter from './procedures/exchangeRates';
import { router } from './trpc';

export const appRouter = router({
  exchangeRates: exchangeRatesRouter,
});

export type AppRouter = typeof appRouter;
