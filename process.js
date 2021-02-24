const { app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const common = require('./common');

const isMac = process.platform === "darwin";
let mainwindow;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true,
      nodeIntegration: true
    }
  });
  Menu.setApplicationMenu(common.menu);
  win.loadFile('main.html');
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});