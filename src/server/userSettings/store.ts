import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import type { UserSettings } from './types';
import UserSettingsEventEmitter from './UserSettingsEventEmitter';

export function getUserSettings(): UserSettings {
  const exists = settingsExist();
  if (!exists) {
    return {
      dbPath: path.join(app.getPath('userData'), 'db.sqlite'),
    };
  }

  const settingsRaw = fs.readFileSync(getUserSettingsPath(), 'utf8');
  return JSON.parse(settingsRaw);
}

export function setUserSettings(settings: UserSettings) {
  let oldSettings: UserSettings | null = null;
  try {
    oldSettings = getUserSettings();
  } catch (e) {
    console.log('No old settings to move');
  }

  fs.writeFileSync(getUserSettingsPath(), JSON.stringify(settings));

  if (oldSettings) {
    applyUserSettingsChanges(oldSettings, settings);
  }

  return settings;
}

function settingsExist() {
  try {
    fs.statSync(getUserSettingsPath());
    return true;
  } catch {
    return false;
  }
}

function applyUserSettingsChanges(old: UserSettings, settings: UserSettings) {
  if (old.dbPath !== settings.dbPath) {
    try {
      fs.copyFileSync(old.dbPath, settings.dbPath);
      console.log(
        `Moved database file from ${old.dbPath} to ${settings.dbPath}`,
      );
    } catch (e) {
      console.error('Failed to move database file', e);
    }
    UserSettingsEventEmitter.emit('dbPathChanged', settings.dbPath);
  }
}

function getUserSettingsPath() {
  return path.join(app.getPath('userData'), 'userSettings.json');
}
