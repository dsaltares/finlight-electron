import { createTRPCClient, httpLink } from '@trpc/client';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';
import type { AppRouter } from './router';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
export const router = t.router;

export const publicProcedure = t.procedure;
export const serverProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.serverAuthorized) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx });
});
export const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user && !ctx.serverAuthorized) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx });
});

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${process.env.BETTER_AUTH_URL}/api/trpc`,
      headers: {
        'x-api-key': process.env.API_KEY as string,
      },
      transformer: superjson,
    }),
  ],
});
