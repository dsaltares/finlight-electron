import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    create table "user_settings" (
      "id" integer not null primary key autoincrement,
      "userId" text not null references "user" ("id") on delete cascade,
      "settings" jsonb not null default '{}',
      "createdAt" text default CURRENT_TIMESTAMP not null,
      "updatedAt" text default CURRENT_TIMESTAMP not null,
      constraint "unique_user_settings_user_id" unique ("userId")
    );
  `.execute(db);
  await sql`
    create trigger "user_settings_updated_at_trigger" after update on "user_settings"
    begin
      update "user_settings" set "updatedAt" = CURRENT_TIMESTAMP where "id" = NEW."id";
    end;
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`drop trigger if exists "user_settings_updated_at_trigger";`.execute(
    db,
  );
  await sql`drop table if exists "user_settings";`.execute(db);
}
