import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    create unique index "unique_csv_import_preset_user_id_name"
      on "csv_import_preset" ("userId", "name");
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    drop index if exists "unique_csv_import_preset_user_id_name";
  `.execute(db);
}
