import { z } from 'zod';
import trpc, { procedure } from './trpc';
import getAccounts from './accounts/getAccounts';
import getCSVImportPresets from './csvImportPreset/getCSVImportPresets';
import createAccount from './accounts/createAccount';
import updateAccount from './accounts/updateAccount';
import deleteAccount from './accounts/deleteAccount';

const router = trpc.router({
  helloWorld: procedure
    .input(z.object({ name: z.string() }))
    .output(z.object({ message: z.string() }))
    .query(async ({ input: { name } }) => ({ message: `Hello, ${name}!` })),
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getCSVImportPresets,
});

export default router;

export type AppRouter = typeof router;
