//Based off the great work here: https://github.com/felixrieseberg/electron-code-editor

const {ipcRenderer, remote} = require('electron');
const fs = require('fs');
const { url } = require('inspector');

class fileManager{
    constructor({editor, monaco}) {
        this.editor = editor;
        this.monaco = monaco;
    }

    openFile() {
        remote.dialog.showOpenDialog((path) => {
            if(!path) return;
            fs.readFile(path, 'utf-8', (err, data) => {
                this.editor.setModel(this.monaco.editor.createModel(data));
            });
        });
    }

    saveFile() {
        remote.dialog.showSaveDialog((path) => {
            if(!path) return;

            const model = this.editor.getModel();
            let data = '';

            model._lines.forEach((line) => {
                data += line.text + model._EOL;
            });
            fs.writeFile(path, data, 'utf-8');
        });
    }
}

module.exports = [
    fileManager
]