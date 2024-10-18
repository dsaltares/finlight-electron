import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { ensureFolderExistsSync } from '@server/utils';
import { UserSettings, UserSettingsFile } from './types';
import UserSettingsEventEmitter from './UserSettingsEventEmitter';

export function getUserSettings(): UserSettings {
  const exists = settingsExist();
  if (!exists) {
    return createNewSettings();
  }

  return readSettings();
}

export function setUserSettings(settings: UserSettings) {
  let oldSettings: UserSettings | null = null;
  try {
    oldSettings = getUserSettings();
  } catch (e) {
    console.log('No old settings to move');
  }

  const file: UserSettingsFile = {
    version: 1,
    settings,
  };

  fs.writeFileSync(getUserSettingsPath(), JSON.stringify(file, null, 2));

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

function applyUserSettingsChanges(
  oldSettings: UserSettings,
  newSettings: UserSettings,
) {
  if (oldSettings.dataPath !== newSettings.dataPath) {
    try {
      fs.renameSync(oldSettings.dataPath, newSettings.dataPath);
      console.log(
        `Moved data files ${oldSettings.dataPath} to ${newSettings.dataPath}`,
      );
    } catch (e) {
      console.error('Failed to move database file', e);
    }
    UserSettingsEventEmitter.emit('dataPathChanged', newSettings.dataPath);
  }
}

function getUserSettingsPath() {
  return path.join(app.getPath('userData'), 'userSettings.json');
}

function createNewSettings(): UserSettings {
  const file: UserSettingsFile = {
    version: 1,
    settings: {
      dataPath: path.join(app.getPath('userData'), 'data'),
    },
  };
  ensureFolderExistsSync(app.getPath('userData'));
  fs.writeFileSync(getUserSettingsPath(), JSON.stringify(file, null, 2));
  return UserSettings.parse(file.settings);
}

function readSettings() {
  const settingsRaw = JSON.parse(
    fs.readFileSync(getUserSettingsPath(), 'utf8'),
  );
  const settingsFile = UserSettingsFile.parse(settingsRaw);
  if (settingsFile.version !== 1) {
    throw new Error('Unsupported settings version');
  }
  return UserSettings.parse(settingsFile.settings);
}
