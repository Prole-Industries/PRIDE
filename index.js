//These are the main processes

const {app, BrowserWindow, Menu, remote} = require('electron');

//Keeps a global reference of the window so it doesn't get yoten by the binman
let mainWindow;

//Because Apple never do things easy, we should keep an eye out to check if we're running on OSX
let isMac = process.platform === 'darwin';

const createWindow = () => {
    //Create browser window
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        frame: false,
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
              accelerator: "CmdOrCtrl+N"
            },
            {
              label: "Open",
              accelerator: "CmdOrCtrl+O"
            },
            {
              label: "Save",
              accelerator: "CmdOrCtrl+S"
            },
            {
              label: "Save As",
              accelerator: "CmdOrCtrl+Shift+S"
            },
            {type: "separator"},
            {
              label: "Fullscreen",
              accelerator: "F11",
              click: () => {
                mainWindow.setFullScreen(!mainWindow.fullScreen);
              }
            },
            // {
            //   label: "Exit",
            //   role: "quit"
            // }
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
            {
              label: "Reload",
              role: "reload",
              accelerator: "CmdOrCtrl+R"
            }
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