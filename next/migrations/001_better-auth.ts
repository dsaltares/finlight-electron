import type { Kysely } from 'kysely';
import { sql } from 'kysely';

export async function up(db: Kysely<unknown>) {
  await sql`
create table "user" ("id" text not null primary key, "name" text not null, "email" text not null unique, "emailVerified" integer not null, "image" text, "createdAt" text default CURRENT_TIMESTAMP not null, "updatedAt" text default CURRENT_TIMESTAMP not null);
  `.execute(db);
  await sql`
create table "session" ("id" text not null primary key, "expiresAt" text not null, "token" text not null unique, "createdAt" text default CURRENT_TIMESTAMP not null, "updatedAt" text not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" ("id") on delete cascade);
  `.execute(db);
  await sql`
create table "account" ("id" text not null primary key, "accountId" text not null, "providerId" text not null, "userId" text not null references "user" ("id") on delete cascade, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" text, "refreshTokenExpiresAt" text, "scope" text, "password" text, "createdAt" text default CURRENT_TIMESTAMP not null, "updatedAt" text not null);
  `.execute(db);
  await sql`
create table "verification" ("id" text not null primary key, "identifier" text not null, "value" text not null, "expiresAt" text not null, "createdAt" text default CURRENT_TIMESTAMP not null, "updatedAt" text default CURRENT_TIMESTAMP not null);
  `.execute(db);
}

export async function down(db: Kysely<unknown>) {
  await sql`drop table if exists "verification";`.execute(db);
  await sql`drop table if exists "account";`.execute(db);
  await sql`drop table if exists "session";`.execute(db);
  await sql`drop table if exists "user";`.execute(db);
}
