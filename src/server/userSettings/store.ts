import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { UserSettings } from './types';

const userSettingsPath = path.join(
  app.getPath('userData'),
  'userSettings.json',
);

export function getUserSettings() {
  const exists = settingsExist();
  if (!exists) {
    return setUserSettings({
      dbPath: path.join(app.getPath('userData'), 'db.sqlite'),
    });
  }

  const settingsRaw = fs.readFileSync(userSettingsPath, 'utf8');
  return UserSettings.parse(JSON.parse(settingsRaw));
}

export function setUserSettings(settings: UserSettings) {
  fs.writeFileSync(userSettingsPath, JSON.stringify(settings));
  return settings;
}

function settingsExist() {
  try {
    fs.statSync(userSettingsPath);
    return true;
  } catch {
    return false;
  }
}
