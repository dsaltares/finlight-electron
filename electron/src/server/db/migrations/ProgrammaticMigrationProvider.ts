import type { Migration, MigrationProvider } from 'kysely';
import createTables from './0001-createTables';
import attachments from './0002-attachments';

export default class ProgrammaticMigrationProvider
  implements MigrationProvider
{
  getMigrations(): Promise<Record<string, Migration>> {
    return Promise.resolve({
      '0001-createTables': createTables,
      '0002-attachments': attachments,
    });
  }
}
