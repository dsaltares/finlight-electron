import { z } from 'zod';
import trpc, { procedure } from './trpc';
import getAccounts from './accounts/getAccounts';
import getCSVImportPresets from './csvImportPreset/getCSVImportPresets';
import createAccount from './accounts/createAccount';
import updateAccount from './accounts/updateAccount';
import deleteAccount from './accounts/deleteAccount';
import getCategories from './category/getCategories';
import getTransactions from './transactions/getTransactions';
import createTransaction from './transactions/createTransaction';
import createTransactions from './transactions/createTransactions';
import updateTransaction from './transactions/updateTransaction';
import updateTransactions from './transactions/updateTransactions';
import deleteTransactions from './transactions/deleteTransactions';
import createCategory from './category/createCategory';
import updateCategory from './category/updateCategory';
import deleteCategory from './category/deleteCategory';
import createCSVImportPreset from './csvImportPreset/createCSVImportPreset';
import updateCSVImportPreset from './csvImportPreset/updateCSVImportPreset';
import deleteCSVImportPreset from './csvImportPreset/deleteCSVImportPreset';

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
  createCSVImportPreset,
  updateCSVImportPreset,
  deleteCSVImportPreset,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTransactions,
  createTransaction,
  createTransactions,
  updateTransaction,
  updateTransactions,
  deleteTransactions,
});

export default router;

export type AppRouter = typeof router;
