'use client';

import {
  keepPreviousData,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createTRPCClient, httpLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { TRPCProvider } from '@/lib/trpc';
import type { AppRouter } from '@/server/trpc/router';

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = (p) => {
  const [queryClient] = useState(createQueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          fetch: (url, options) =>
            fetch(url, { ...options, cache: 'no-cache' } as RequestInit),
        }),
      ],
    }),
  );
  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools client={queryClient} position="bottom" />
        {p.children}
      </QueryClientProvider>
    </TRPCProvider>
  );
};

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.BETTER_AUTH_URL) return `${process.env.BETTER_AUTH_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

function createQueryClient() {
  const queryClient: QueryClient = new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        if (!mutation.options.meta?.skipGlobalInvalidation) {
          queryClient.invalidateQueries();
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1 * 60 * 1000, // 1 minute
        gcTime: 1 * 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: true,
        refetchOnReconnect: 'always',
        refetchOnMount: true,
        placeholderData: keepPreviousData,
      },
    },
  });
  return queryClient;
}
