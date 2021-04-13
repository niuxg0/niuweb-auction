import { app, BrowserWindow, dialog, ipcMain, nativeImage } from 'electron';
import fs from 'fs';
import path from 'path';
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('openDirectory', async (event) => {
  const directory = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  event.returnValue = directory.filePaths
})

ipcMain.on('readDirectory', (event, path) => {
  event.returnValue = fs.readdirSync(path, { withFileTypes: true }).map((file) => ({
    name: file.name,
    isDirectory: file.isDirectory()
  }))
})

ipcMain.on('copyFile', async (event, fromPath, from, toPath, to, compressSize) => {
  try {
    if (compressSize === 0) {
      fs.copyFileSync(path.join(fromPath, from), path.join(toPath, to), fs.constants.COPYFILE_EXCL)
    } else {
      const orderSize = compressSize * 1024
      const input = fs.readFileSync(path.join(fromPath, from))
      if (input.length > orderSize) {
        const image = nativeImage.createFromBuffer(input)
        let quality = 110
        let output = null
        do {
          quality-= 10
          output = image.toJPEG(quality)
        } while (output.length > orderSize && quality > 0)
        fs.writeFileSync(path.join(toPath, to), output)
      } else {
        fs.writeFileSync(path.join(toPath, to), input)
      }
    }
    event.returnValue = { status: 1 }
  } catch (err) {
    event.returnValue = { status: 2, message: err }
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
