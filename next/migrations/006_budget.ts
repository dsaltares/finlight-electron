import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    create table if not exists "budget" (
      "id" integer not null primary key autoincrement,
      "userId" text not null references "user" ("id") on delete cascade,
      "granularity" text not null default 'Monthly',
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null
    );
  `.execute(db);
  await sql`
    create trigger if not exists "budget_updated_at_trigger" after update on "budget"
    begin
      update "budget" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);
  await sql`
    create table if not exists "budget_entry" (
      "id" integer not null primary key autoincrement,
      "budgetId" integer not null references "budget" ("id") on delete cascade,
      "categoryId" integer not null references "category" ("id") on delete cascade,
      "type" text not null default 'Expense',
      "target" integer not null default 0,
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null
    );
  `.execute(db);
  await sql`
    create trigger if not exists "budget_entry_updated_at_trigger" after update on "budget_entry"
    begin
      update "budget_entry" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`drop trigger if exists "budget_entry_updated_at_trigger";`.execute(
    db,
  );
  await sql`drop table if exists "budget_entry";`.execute(db);
  await sql`drop trigger if exists "budget_updated_at_trigger";`.execute(db);
  await sql`drop table if exists "budget";`.execute(db);
}
