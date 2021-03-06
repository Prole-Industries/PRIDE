//These are the main processes

const { BrowserWindow, Menu, app, dialog, ipcMain, ipcRenderer, remote} = require('electron');
const fs = require('fs');

//Keeps a global reference of the window so it doesn't get yoten by the binman
let mainWindow;
let menuBar;

//Because Apple never do things easy, we should keep an eye out to check if we're running on OSX
let isMac = process.platform === 'darwin';

let renderer;
ipcMain.on("CONNECTR", (event) => {
    renderer = event.sender;
});

const createWindow = () => {
    //Create browser window
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        frame: false,
        icon: "resources/icon.png",
        titleBarStyle: 'hidden',
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true
        }
    });

    //Prep the titlebar
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
            {
                label: "New",
                accelerator: "CmdOrCtrl+N",
                click: () => {
                    renderer.send("newFile");
                }
            },
            {
                label: "Open",
                accelerator: "CmdOrCtrl+O",
                click: () => {
                    renderer.send("openFile");
                }
            },
            {
                label: "Save",
                accelerator: "CmdOrCtrl+S",
                click: () => {
                    renderer.send("saveFile");
                }
            },
            {
                label: "Save As",
                accelerator: "CmdOrCtrl+Shift+S",
                click: () => {
                    renderer.send("saveFileAs");
                }
            },
            {type: "separator"},
            {
                label: "Fullscreen",
                accelerator: "F11"
            },
            ]
        },
        {
            label: "Edit",
            submenu: [
            {
                label: "Undo",
                role: "undo",
                accelerator: "CmdOrCtrl+Z"
            },
            {
                label: "Redo",
                role: "redo",
                accelerator: "CmdOrCtrl+Shift+Z"
            },
            {type: "separator"},
            {
                label: "Cut",
                role: "cut",
                accelerator: "CmdOrCtrl+X"
            },
            {
                label: "Copy",
                role: "copy",
                accelerator: "CmdOrCtrl+C"
            },
            {
                label: "Paste",
                role: "paste",
                accelerator: "CmdOrCtrl+V"
            },
            ]
        },
        {
            label: "Options",
            submenu: [
            {
                label: "Options Menu",
                accelerator: "CmdOrCtrl+Alt+M"
            },
            {type: "separator"},
            {
                label: "Help",
                accelerator: "CmdOrCtrl+?"
            },
            {
                label: "Docs",
                accelerator: "CmdOrCtrl+Alt+D"
            },
            {type: "separator"},
            {
                label: "Reload",
                role: "reload",
                accelerator: "CmdOrCtrl+R"
            },
            {
                label: "Devtools",
                accelerator: "F12",
                click: () => {
                    mainWindow.webContents.openDevTools();
                }
            },
            ]
        },
        {
            label: "Compile",
            accelerator: "F5"
        }
    ]));

    //Open the main splash screen
    mainWindow.loadFile('index.html');
}

//Called after initialisation, we're ready to make windows
app.whenReady().then(() => {
    createWindow();
    
});

//Quit when all windows are closed if it's OSX
app.on('window-all-closed', () => {
    //I told you Apple were difficult. Mac doesn't close programs unless the user pressed Cmd+Q
    if(!isMac) app.quit();
});

app.on('activate', () => {
    //ffs Apple, I don't even know
    if(mainWindow === null) createWindow();
});