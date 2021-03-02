const { Menu } = require('electron');
const Main = require('./main');

//Connect the click-binds to the menu, because document doesn't work in the main renderer.

//Open bind
Main.Menu[0].submenu[1].click = () => {
    dialog.showOpenDialog({ properties: ['openFile']}).then((result) => {
        let path = result.filePaths[0];
        document.getElementById("filepath").innerText = path;
        console.log(document.editor);
    });
}

//Fullscreen bind
Main.Menu[0].submenu[5].click = () => {
    mainWindow.setFullScreen(!mainWindow.fullScreen);
}