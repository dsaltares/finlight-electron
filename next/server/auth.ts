import { APIError, betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';
import { createAuthMiddleware } from 'better-auth/api';

export const auth = betterAuth({
  database: { db, type: 'sqlite' },
  trustedOrigins: [process.env.BETTER_AUTH_URL as string],
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Check email allowlist after OAuth callback
      if (ctx.path.includes('/callback/')) {
        const user = ctx.context?.user;
        if (!user?.email) {
          return;
        }

        const allowedEmails = (process.env.EMAIL_ALLOW_LIST ?? '')
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const allowedDomains = (process.env.EMAIL_DOMAIN_ALLOW_LIST ?? '')
            .split(',')
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean);

        const emailLc = user.email.toLowerCase();
        const domain = emailLc.split('@')[1] ?? '';

        const emailAllowed =
          (allowedEmails.length === 0 && allowedDomains.length === 0) ||
          allowedEmails.includes(emailLc) ||
          allowedDomains.includes(domain);

        if (!emailAllowed) {
          throw new APIError('BAD_REQUEST', {
            message: `${user.email} is not authorized to sign in`,
          });
        }
      }
    }),
  },
});
