import { auth } from '@/server/auth';

export async function createContext({ headers }: { headers: Headers }) {
  const session = await auth.api.getSession({ headers });
  const apiKey = headers.get('x-api-key');
  const serverAuthorized = apiKey === process.env.API_KEY;
  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    serverAuthorized,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
