const {Menu} = require('electron');

let menu = Menu.buildFromTemplate([
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
          role: "togglefullscreen"
        },
        {
          label: "Exit",
          role: "quit"
        }
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
        {type: "separator"},
        {
          label: "Find",
          role: "find",
          accelerator: "CmdOrCtrl+X"
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
]);

module.exports = {
    menu
};