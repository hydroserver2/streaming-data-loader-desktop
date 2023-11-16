import { app, BrowserWindow, Tray, nativeImage, Menu } from 'electron';
import path from 'path';
import os from 'os';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

let mainWindow: BrowserWindow | undefined;
let mainTray: Tray | undefined


function createTray (): void {
  /**
   * Initial tray options
   */

  let icon = nativeImage.createFromPath(path.resolve(__dirname, 'icons/icon.png'))
  icon = icon.resize({ height: 16, width: 16 })

  console.log(path.resolve(__dirname, 'icons/icon.png'))

  mainTray = new Tray(icon)
  const trayMenu = Menu.buildFromTemplate([
    {'label': 'Streaming Data Loader is running', 'type': 'normal', 'enabled': false},
    {'label': '', 'type': 'separator'},
    {'label': 'HydroServer Connection', 'type': 'normal',},
    {'label': 'Data Sources Dashboard', 'type': 'normal'},
    {'label': 'View Log Output', 'type': 'normal'},
  ])
  mainTray.setToolTip('HydroServer Streaming Data Loader');
  mainTray.setContextMenu(trayMenu);
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

app.whenReady().then(createTray);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});
