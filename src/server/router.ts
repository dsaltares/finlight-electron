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
import getAccountBalancesReport from './reports/getAccountBalancesReport';
import getBalanceForecastReport from './reports/getBalanceForecastReport';
import getBucketedCategoryReport from './reports/getBucketedCategoryReport';
import getCategoryReport from './reports/getCategoryReport';
import getIncomeVsExpensesReport from './reports/getIncomeVsExpensesReport';
import updateBudget from './budget/updateBudget';
import getBudget from './budget/getBudget';
import getExchangeRates from './exchangeRates/getExchangeRates';
import refreshExchangeRates from './exchangeRates/refreshExchangeRates';
import getValue from './keyValue/getValue';
import updateValue from './keyValue/updateValue';
import updateUserSettings from './userSettings/updateUserSettings';
import getUserSettings from './userSettings/getUserSettings';
import updateExchangeRates from './exchangeRates/updateExchangeRates';
import createExchangeRate from './exchangeRates/createExchangeRate';
import showOpenDialog from './main/showOpenDialog';
import createAttachment from './attachments/createAttachment';
import getAttachments from './attachments/getAttachments';
import deleteAttachment from './attachments/deleteAttachment';
import showItemInFolder from './main/showItemInFolder';
import openPath from './main/openPath';

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
  getAccountBalancesReport,
  getBalanceForecastReport,
  getBucketedCategoryReport,
  getCategoryReport,
  getIncomeVsExpensesReport,
  getBudget,
  updateBudget,
  getExchangeRates,
  createExchangeRate,
  updateExchangeRates,
  refreshExchangeRates,
  getValue,
  updateValue,
  getUserSettings,
  updateUserSettings,
  showOpenDialog,
  showItemInFolder,
  openPath,
  getAttachments,
  createAttachment,
  deleteAttachment,
});

export default router;

export type AppRouter = typeof router;
