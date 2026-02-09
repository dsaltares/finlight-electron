import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { AppRouter } from '@/server/trpc/router';

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
