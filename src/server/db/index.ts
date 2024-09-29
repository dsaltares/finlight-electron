import type { Kysely } from 'kysely';
import { getUserSettings } from '@server/userSettings/store';
import UserSettingsEventEmitter from '@server/userSettings/UserSettingsEventEmitter';
import { getDbPath } from '@server/userSettings/utils';
import createDb from './createDb';
import type { Database } from './types';

let db: Kysely<Database> = getDb();

export default db;

UserSettingsEventEmitter.on('dataPathChanged', refreshDb);

export function refreshDb() {
  db = getDb();
}

function getDb() {
  const settings = getUserSettings();
  const dbPath = getDbPath(settings);
  return createDb(dbPath);
}
