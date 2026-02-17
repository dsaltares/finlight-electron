import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
    alter table "category"
    add column "color" text not null default '#64748B';
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`
    alter table "category"
    drop column "color";
  `.execute(db);
}
