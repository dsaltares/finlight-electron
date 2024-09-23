import type { Kysely } from 'kysely';
import { getUserSettings } from '@server/userSettings/store';
import UserSettingsEventEmitter from '@server/userSettings/UserSettingsEventEmitter';
import createDb from './createDb';
import type { Database } from './types';

let db: Kysely<Database> = getDb();

export default db;

UserSettingsEventEmitter.on('dbPathChanged', refreshDb);

export function refreshDb() {
  db = getDb();
}

function getDb() {
  const dbPath = getUserSettings().dbPath;
  return createDb(dbPath);
}
