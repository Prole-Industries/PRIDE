//These are the main processes

console.log("Hello again, friend of a friend");

const { BrowserWindow, Menu, app, ipcMain, dialog } = require('electron');
const fs = require('fs');
const edge = require('electron-edge-js');

//Keeps a global reference of the window so it doesn't get yoten by the binman
let mainWindow;
let menuBar;

//Because Apple never do things easy, we should keep an eye out to check if we're running on OSX
let isMac = process.platform === 'darwin';

//This lets us send ipc calls between the main and renderer processes.
let renderer;                           //Initialise a global for the renderer
ipcMain.on("CONNECTR", (event) => {     //Once the signal CONNECTR is received, set renderer to be the sender of the signal.
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

    //Prep the titlebar - for some actions, we use ipcRenderer calls to act them, as a lot of their code runs in the renderer.
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: "File",
            submenu: [
                {
                    label: "New",                       //Create a new file
                    accelerator: "CmdOrCtrl+N",
                    click: () => {
                        renderer.send("newFile");
                    }
                },
                {
                    label: "Open",                      //Open a file
                    accelerator: "CmdOrCtrl+O",
                    click: () => {
                        renderer.send("openFile");
                    }
                },
                {
                    label: "Save",                      //Save a file
                    accelerator: "CmdOrCtrl+S",
                    click: () => {
                        renderer.send("saveFile");
                    }
                },
                {
                    label: "Save As",                   //Save a file as something
                    accelerator: "CmdOrCtrl+Shift+S",
                    click: () => {
                        renderer.send("saveFileAs");
                    }
                },
                { type: "separator" },
                {
                    label: "Fullscreen",
                    accelerator: "F11"
                },
            ]
        },
        {
            //This is self explanatory
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
                { type: "separator" },
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
                    label: "Options Menu",              //Open a window of options (tbd)
                    accelerator: "CmdOrCtrl+Alt+M"
                },
                { type: "separator" },
                {
                    label: "Help",                      //Link to a PRIDE help page
                    accelerator: "CmdOrCtrl+?"
                },
                {
                    label: "Docs",                      //Link to the docs of the specified language
                    accelerator: "CmdOrCtrl+Alt+D"
                },
                {
                    label: "Load New Language",         //Installs a new language from a language .dll
                    accelerator: "CmdOrCtrl+L",
                    click: async () => {
                        try {
                            let path;
                            await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: "DLL", extensions: ['dll'] }] }).then((fpath) => {  //Select a .dll to load from
                                path = fpath.filePaths[0];
                            });
                            let load = edge.func({
                                assemblyFile: path,     //Locate the assembly that's been specified
                                typeName: 'Main',       //The class containing the method we want to run
                                methodName: 'Introduce' //The method we want to run - this one returns a dictionary of metadata about the language
                            });

                            let metadata;
                            load(null, (err, res) => {  //Get the metadata from the assembly and load it into a variable (json)
                                if (err) throw err;
                                else metadata = res;
                            });

                            ['Name', 'Version', 'Designer', 'Description', 'Extensions'].forEach((key) => { //If any metadata is missing, alert the user to it.
                                if (metadata[key] === undefined) Alert(`Invalid DLL: The key ${key} was not provided in the required language metadata.`); return;
                            });

                            let response;
                            await dialog.showMessageBox(mainWindow, {    //One last check to see if the user wants to install the language
                                type: 'question',
                                buttons: ['Install', 'Cancel'],
                                defaultId: 0,
                                title: 'PRIDE',
                                message: `You are about to install the language ${metadata.Name}, do you wish to proceed?`,
                                detail: `Name: ${metadata.Name}\nDescription: ${metadata.Description}\n\nVersion: ${metadata.Version}\nDesigner: ${metadata.Designer}\nFile Extensions: ${metadata.Extensions.join(", ")}`
                            }).then((_response) => { response = _response.response; });

                            if (response == 0) {  //The user wants to install the language
                                let rootLangDir = "./languages";                            //Root language directory
                                let langDir = `${rootLangDir}/${metadata.Name}`;            //The directory we'll be creating for the language
                                if (!fs.existsSync(rootLangDir)) fs.mkdir(rootLangDir, (err) => { if (err) throw err; });  //If the root langauge directory doesn't exist for some reason, make it.
                                if (!fs.existsSync(langDir)) fs.mkdir(langDir, (err) => { if (err) throw err; });

                                let getTokens = edge.func({
                                    assemblyFile: path,
                                    typeName: 'Main',
                                    methodName: 'GetTokens'
                                });
                                console.log(getTokens);
                                let tokens;
                                getTokens(null, (err, res) => {
                                    if (err) throw err;
                                    else tokens = res;
                                });

                                fs.writeFile(`${langDir}/${metadata.Name}-language.json`, {
                                    "Name": metadata.Name,
                                    "Description": metadata.Description,
                                    "Version": metadata.Version,
                                    "Designer": metadata.Designer,
                                    "Extensions": metadata.Extensions,
                                    "Tokens": tokens,
                                }.toString(), (err) => { if (err) throw err; });

                                fs.copyFile(path, `${langDir}/${metadata.Name}.dll`, (err) => { if (err) throw err; });
                            }
                            else return;
                        } catch (e) {
                            Alert(e);   //If anything goes wrong, tell the user
                        }
                    }
                },
                { type: "separator" },
                {
                    label: "Reload",            //DEBUG FUNCTION: this reloads any renderer processes (.html, .css, all .js files EXCEPT THIS ONE)
                    role: "reload",
                    accelerator: "CmdOrCtrl+R"
                },
                {
                    label: "Devtools",          //Basically inspect element
                    accelerator: "F12",
                    click: () => {
                        mainWindow.webContents.openDevTools();
                    }
                },
            ]
        },
        {
            label: "Compile",   //Compile the code
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
    if (!isMac) app.quit();
});

app.on('activate', () => {
    //ffs Apple, I don't even know
    if (mainWindow === null) createWindow();
});



function Alert(msg) {
    dialog.showMessageBox(mainWindow, { //If anything goes wrong, this function can be called and will create an error box to describe the issue.
        type: 'error',
        title: 'PRIDE',
        message: msg.toString()
    })
}