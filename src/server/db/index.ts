import createDb from './createDb';

let db = createDb();

export default db;

export function refreshDb() {
  db = createDb();
}
