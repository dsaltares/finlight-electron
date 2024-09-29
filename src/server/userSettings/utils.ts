import path from 'path';
import type { UserSettings } from './types';

export function getDbPath(settings: UserSettings) {
  return path.join(settings.dataPath, 'db.sqlite');
}

export function getAttachmentsPath(settings: UserSettings) {
  return path.join(settings.dataPath, 'attachments');
}
