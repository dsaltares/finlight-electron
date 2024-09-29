import type { BrowserWindowConstructorOptions } from 'electron';
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { migrateToLatest } from '@server/db/migrations';
import router from '@server/router';
import { createIPCHandler } from '@lib/electron-trpc/main';
import { getUserSettings } from '@server/userSettings/store';
import { getDbPath } from '@server/userSettings/utils';
import setAppMenu from './appMenu';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});

function createWindow(options?: BrowserWindowConstructorOptions) {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      ...(options?.webPreferences || {}),
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
    icon: path.join(__dirname, 'images', 'icon.png'),
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  if (!app.isPackaged) {
    window.webContents.openDevTools();
  }

  window.webContents.setWindowOpenHandler(({ url }) => {
    const newUrl = maybeParseUrl(url);
    const currentUrl = maybeParseUrl(window.webContents.getURL());

    if (!newUrl || !currentUrl) {
      return { action: 'deny' };
    }

    if (!isOpeningApp(currentUrl, newUrl)) {
      void openExternalUrl(url);
      return { action: 'deny' };
    }

    return {
      action: 'allow',
      createWindow: (options) => {
        const newWindow = createWindow(options);
        void newWindow.webContents.loadURL(url);

        if (process.platform === 'darwin') {
          window.addTabbedWindow(newWindow);
        }

        return newWindow.webContents;
      },
      outlivesOpener: true,
      overrideBrowserWindowOptions: {
        width: 1280,
        height: 720,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
          nodeIntegration: true,
        },
      },
    };
  });

  return window;
}

function isOpeningApp(currentUrl: URL, newUrl: URL) {
  if (app.isPackaged) {
    return (
      currentUrl.protocol === 'file:' &&
      currentUrl.protocol === newUrl.protocol &&
      currentUrl.pathname === newUrl.pathname
    );
  }

  return (
    currentUrl.hostname === 'localhost' &&
    currentUrl.host === newUrl.host &&
    currentUrl.pathname === newUrl.pathname
  );
}

async function openExternalUrl(url: string) {
  const parsedUrl = maybeParseUrl(url);
  if (!parsedUrl) {
    return;
  }

  const { protocol } = parsedUrl;
  // We could handle all possible link cases here, not only http/https
  if (protocol === 'http:' || protocol === 'https:') {
    try {
      await shell.openExternal(url);
    } catch (error: unknown) {
      console.error(`Failed to open url: ${error}`);
    }
  }
}

function maybeParseUrl(value: string): URL | undefined {
  if (typeof value === 'string') {
    try {
      return new URL(value);
    } catch (err) {
      // Errors are ignored, as we only want to check if the value is a valid url
      console.error(`Failed to parse url: ${value}`);
    }
  }

  return undefined;
}

async function onReady() {
  const settings = getUserSettings();
  const dbPath = getDbPath(settings);
  await migrateToLatest(dbPath);
  const window = await createWindow();
  createIPCHandler({ router, windows: [window] });
  setAppMenu();
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
