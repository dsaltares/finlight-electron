import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { getLogger } from '@/server/logger';
import { createContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/router';

const logger = getLogger('tRPC');

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async ({ req }) => createContext({ headers: req.headers }),
    onError: ({ error, path, type }) => {
      logger.error(
        { error, path, type, cause: error.cause },
        'tRPC request failed',
      );
    },
  });

export { handler as GET, handler as POST };
