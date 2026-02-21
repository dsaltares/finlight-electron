import { timingSafeEqual } from 'node:crypto';
import { auth } from '@/server/auth';

function isValidApiKey(apiKey: string | null): boolean {
  const expected = process.env.API_KEY;
  if (!apiKey || !expected) return false;
  if (apiKey.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(apiKey), Buffer.from(expected));
}

export async function createContext({ headers }: { headers: Headers }) {
  const session = await auth.api.getSession({ headers });
  const apiKey = headers.get('x-api-key');
  const serverAuthorized = isValidApiKey(apiKey);
  return {
    user: session?.user ?? null,
    session: session?.session ?? null,
    serverAuthorized,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
