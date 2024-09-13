import type { Migration, MigrationProvider } from 'kysely';
import createTables from './0001-createTables';

export default class ProgrammaticMigrationProvider
  implements MigrationProvider
{
  getMigrations(): Promise<Record<string, Migration>> {
    return Promise.resolve({
      '0001-createTables': createTables,
    });
  }
}
