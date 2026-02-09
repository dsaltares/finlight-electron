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

export function ensureFolderExistsSync(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}
