import type {
  Generated,
  Selectable,
  Updateable,
  Insertable,
  JSONColumnType,
} from 'kysely';

export interface Database {
  exchangeRate: ExchangeRateTable;
  csvImportPreset: CSVImportPresetTable;
  bankAccount: BankAccountTable;
  category: CategoryTable;
  accountTransaction: AccountTransactionTable;
  budget: BugetTable;
  budgetEntry: BudgetEntryTable;
  keyValue: KeyValueTable;
  attachment: AttachmentTable;
}

export interface ExchangeRateTable {
  id: Generated<number>;
  ticker: string;
  open: number;
  low: number;
  high: number;
  close: number;
  date: string;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
}
export type ExchangeRate = Selectable<ExchangeRateTable>;
export type NewExchangeRate = Insertable<ExchangeRateTable>;
export type ExchangeRateUpdate = Updateable<ExchangeRateTable>;

export type CSVImportField =
  | 'Date'
  | 'Amount'
  | 'Withdrawal'
  | 'Deposit'
  | 'Fee'
  | 'Description'
  | 'Ignore';
export interface CSVImportPresetTable {
  id: Generated<number>;
  name: string;
  fields: JSONColumnType<CSVImportField[]>;
  dateFormat: string;
  delimiter: string;
  decimal: string;
  rowsToSkipStart: number;
  rowsToSkipEnd: number;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
  deletedAt: string | null;
}
export type CSVImportPreset = Selectable<CSVImportPresetTable>;
export type NewCSVImportPreset = Insertable<CSVImportPresetTable>;
export type CSVImportPresetUpdate = Updateable<CSVImportPresetTable>;

export type BankAccountTable = {
  id: Generated<number>;
  name: string;
  initialBalance: number;
  balance: number;
  currency: string;
  csvImportPresetId: number | null;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
  deletedAt: string | null;
};
export type BankAccount = Selectable<BankAccountTable>;
export type NewBankAccount = Insertable<BankAccountTable>;
export type BankAccountUpdate = Updateable<BankAccountTable>;

export interface CategoryTable {
  id: Generated<number>;
  name: string;
  importPatterns: JSONColumnType<Array<string>>;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
  deletedAt: string | null;
}
export type Category = Selectable<CategoryTable>;
export type NewCategory = Insertable<CategoryTable>;
export type CategoryUpdate = Updateable<CategoryTable>;

type TransactionType = 'Income' | 'Expense' | 'Transfer';
export interface AccountTransactionTable {
  id: Generated<number>;
  accountId: number;
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: number | null;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
  deletedAt: string | null;
}
export type AccountTransaction = Selectable<AccountTransactionTable>;
export type NewTransaction = Insertable<AccountTransactionTable>;
export type TransactionUpdate = Updateable<AccountTransactionTable>;

export type BudgetGranularity = 'Monthly' | 'Quarterly' | 'Yearly';
export interface BugetTable {
  id: Generated<number>;
  granularity: Generated<BudgetGranularity>;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
}
export type Budget = Selectable<BugetTable>;
export type NewBudget = Insertable<BugetTable>;
export type BudgetUpdate = Updateable<BugetTable>;

export type BudgetEntryType = 'Income' | 'Expense';
export interface BudgetEntryTable {
  id: Generated<number>;
  type: BudgetEntryType;
  budgetId: number;
  categoryId: number;
  target: number;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
}
export type BudgetEntry = Selectable<BudgetEntryTable>;
export type NewBudgetEntry = Insertable<BudgetEntryTable>;
export type BudgetEntryUpdate = Updateable<BudgetEntryTable>;

export interface KeyValueTable {
  id: Generated<number>;
  key: string;
  value: string;
  createdAt: Generated<string>;
  updatedAt: Generated<string>;
  deletedAt: string | null;
}

export type KeyValue = Selectable<KeyValueTable>;
export type NewKeyValue = Insertable<KeyValueTable>;
export type KeyValueUpdate = Updateable<KeyValueTable>;

export interface AttachmentTable {
  id: Generated<number>;
  transactionId: number;
  filename: string;
  type: string;
  createdAt: Generated<string>;
  deletedAt: string | null;
}

export type Attachment = Selectable<AttachmentTable>;
export type NewAttachment = Insertable<AttachmentTable>;
export type AttachmentUpdate = Updateable<AttachmentTable>;
