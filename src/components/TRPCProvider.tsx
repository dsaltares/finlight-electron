import {
  keepPreviousData,
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { loggerLink } from '@trpc/react-query';
import client from '@lib/client';
import { ipcLink } from '@lib/electron-trpc/renderer';

export default function TRPCProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient());
  const [trpcClient] = useState(() =>
    client.createClient({
      links: [loggerLink(), ipcLink()],
    }),
  );
  return (
    <client.Provider client={trpcClient} queryClient={queryClient}>
      <ReactQueryDevtools client={queryClient} position="bottom" />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </client.Provider>
  );
}

function createQueryClient() {
  const queryClient: QueryClient = new QueryClient({
    mutationCache: new MutationCache({
      // On every mutation, we mark all queries as stale.
      // That way, we don't need to worry about manually invalidating queries.
      // https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations#the-global-cache-callbacks
      onSuccess: () => queryClient.invalidateQueries(),
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
