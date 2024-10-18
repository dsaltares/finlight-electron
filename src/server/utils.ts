import fs from 'fs';
import fsPromises from 'fs/promises';

export async function fileExists(filePath: string) {
  try {
    await fsPromises.stat(filePath);
    return true;
  } catch (_e) {
    return false;
  }
}

export async function fileExistsSync(filePath: string) {
  try {
    fs.statSync(filePath);
    return true;
  } catch (_e) {
    return false;
  }
}
