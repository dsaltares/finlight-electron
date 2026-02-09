import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    create table "exchange_rate" (
      "id" integer not null primary key,
      "ticker" text not null,
      "open" real not null,
      "low" real not null,
      "high" real not null,
      "close" real not null,
      "date" text not null,
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      constraint "unique_exchange_rate_ticker" unique ("ticker")
    );
  `.execute(db);
  await sql`
    create trigger "exchange_rate_updated_at_trigger" after update on "exchange_rate"
    begin
      update "exchange_rate" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);

  await sql`
    create table "csv_import_preset" (
      "id" integer not null primary key,
      "userId" text not null references "user" ("id") on delete cascade,
      "name" text not null,
      "fields" jsonb not null,
      "dateFormat" text not null,
      "delimiter" text not null,
      "decimal" text not null,
      "rowsToSkipStart" integer default 0 not null,
      "rowsToSkipEnd" integer default 0 not null,
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      "deletedAt" text
    );
  `.execute(db);
  await sql`
    create trigger "csv_import_preset_updated_at_trigger" after update on "csv_import_preset"
    begin
      update "csv_import_preset" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);

  await sql`
    create table "bank_account" (
      "id" integer not null primary key,
      "userId" text not null references "user" ("id") on delete cascade,
      "name" text not null,
      "initialBalance" integer default 0 not null,
      "balance" integer default 0 not null,
      "currency" text default 'EUR' not null,
      "csvImportPresetId" integer references "csv_import_preset" ("id"),
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      "deletedAt" text,
      constraint "unique_bank_account_name" unique ("name")
    );
  `.execute(db);
  await sql`
    create trigger "bank_account_updated_at_trigger" after update on "bank_account"
    begin
      update "bank_account" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);

  await sql`
    create table "category" (
      "id" integer not null primary key,
      "userId" text not null references "user" ("id") on delete cascade,
      "name" text not null,
      "importPatterns" jsonb not null,
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      "deletedAt" text,
      constraint "unique_category_name" unique ("name")
    );
  `.execute(db);
  await sql`
    create trigger "category_updated_at_trigger" after update on "category"
    begin
      update "category" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);

  await sql`
    create table "account_transaction" (
      "id" integer not null primary key,
      "amount" integer not null,
      "date" text default CURRENT_TIMESTAMP not null,
      "description" text default '' not null,
      "accountId" integer not null references "bank_account" ("id"),
      "type" text default 'Expense' not null,
      "categoryId" integer references "category" ("id"),
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      "deletedAt" text,
      constraint "account_transaction_type_check" check ("type" in ('Income', 'Expense', 'Transfer'))
    );
  `.execute(db);
  await sql`
    create trigger "account_transaction_updated_at_trigger" after update on "account_transaction"
    begin
      update "account_transaction" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);

  await sql`
    create table "budget" (
      "id" integer not null primary key,
      "userId" text not null references "user" ("id") on delete cascade,
      "granularity" text default 'Monthly' not null,
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      constraint "budget_granularity_check" check ("granularity" in ('Monthly', 'Quarterly', 'Yearly'))
    );
  `.execute(db);
  await sql`
    create trigger "budget_updated_at_trigger" after update on "budget"
    begin
      update "budget" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);

  await sql`
    create table "budget_entry" (
      "id" integer not null primary key,
      "type" text not null,
      "budgetId" integer not null references "budget" ("id"),
      "categoryId" integer not null references "category" ("id"),
      "target" integer not null,
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      constraint "budget_entry_type_check" check ("type" in ('Income', 'Expense'))
    );
  `.execute(db);
  await sql`
    create trigger "budget_entry_updated_at_trigger" after update on "budget_entry"
    begin
      update "budget_entry" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);

  await sql`
    create table "attachment" (
      "id" integer not null primary key,
      "filename" text not null,
      "transactionId" integer not null references "account_transaction" ("id"),
      "type" text not null,
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "deletedAt" text,
      constraint "unique_attachment_transaction_id_filename" unique ("transactionId", "filename")
    );
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`drop table if exists "attachment";`.execute(db);
  await sql`drop table if exists "budget_entry";`.execute(db);
  await sql`drop table if exists "budget";`.execute(db);
  await sql`drop table if exists "account_transaction";`.execute(db);
  await sql`drop table if exists "category";`.execute(db);
  await sql`drop table if exists "bank_account";`.execute(db);
  await sql`drop table if exists "csv_import_preset";`.execute(db);
  await sql`drop table if exists "exchange_rate";`.execute(db);
}
