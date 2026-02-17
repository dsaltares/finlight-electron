import { APIError, betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { authDb } from './db';

export const auth = betterAuth({
  database: { db: authDb, type: 'sqlite' },
  trustedOrigins: [process.env.BETTER_AUTH_URL as string],
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isEmailAllowed(user.email)) {
            throw new APIError('BAD_REQUEST', {
              code: 'EMAIL_NOT_AUTHORIZED',
              message: `${user.email} is not authorized to sign in`,
            });
          }
        },
      },
    },
    session: {
      create: {
        before: async (session, context) => {
          const adapter = context?.context?.internalAdapter;
          if (!adapter) {
            return;
          }

          const user = await adapter.findUserById(String(session.userId));
          if (!isEmailAllowed(user?.email)) {
            throw new APIError('BAD_REQUEST', {
              code: 'EMAIL_NOT_AUTHORIZED',
              message: `${user?.email ?? 'Unknown user'} is not authorized to sign in`,
            });
          }
        },
      },
    },
  },
});

function getAllowLists() {
  const allowedEmails = (process.env.EMAIL_ALLOW_LIST ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const allowedDomains = (process.env.EMAIL_DOMAIN_ALLOW_LIST ?? '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return { allowedEmails, allowedDomains };
}

const isEmailAllowed = (email?: string | null) => {
  const { allowedEmails, allowedDomains } = getAllowLists();

  if (!email) {
    return false;
  }

  const emailLc = email.toLowerCase();
  const domain = emailLc.split('@')[1] ?? '';

  return (
    (allowedEmails.length === 0 && allowedDomains.length === 0) ||
    allowedEmails.includes(emailLc) ||
    allowedDomains.includes(domain)
  );
};
