const ctb = require('custom-electron-titlebar');
const { ipcRenderer, Menu, remote } = require('electron');
const fs = require('fs');

var debug = {};

var isopening = false;  //We use this flag so that when we open a file, it doesn't get changed to * by the editor change detector.

var titlebar = new ctb.Titlebar({
    backgroundColor: ctb.Color.fromHex('#800000')
});
titlebar.updateTitle("PRIDE");

ipcRenderer.send("CONNECTR");

ipcRenderer.on("newFile", (event, arg) => {
    newFile();
});

ipcRenderer.on("openFile", (event, arg) => {
    openFile();
});

ipcRenderer.on("saveFile", (event, arg) => {
    saveFile();
});

ipcRenderer.on("saveFileAs", (event, arg) => {
    saveFileAs();
});

function newFile() {
    if(filepath.innerHTML.charAt(filepath.innerHTML.length - 1) == "*"){
        let response = remote.dialog.showMessageBox(null, {
            type: 'question',
            buttons: ['Yes', 'No', 'Cancel'],
            defaultId: 2,
            title: 'PRIDE',
            message: 'You have unsaved changes, do you want to save this file before creating a new file?',
        }).then((_response)=> {
            let response = _response.response;

            switch(response){
                case 0:
                    saveFile();
                    break;
                case 2:
                    return;
            }
        });
    }
}

function openFile() {
    isopening = true;
    remote.dialog.showOpenDialog({ properties: ['openFile'] }).then((fpath) => {
        let path = fpath.filePaths[0];
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) throw err;
            editor.getModel().setValue(data);
        });
        filepath.innerHTML = path;
    });
}

function saveFileAs() {
    let code = editor.getModel().getValue();
    remote.dialog.showSaveDialog().then((fpath) => {
        let path = fpath.filePath;

        fs.writeFile(path, code, (err) => {
            if (err) throw err;
        });
        filepath.innerHTML = path;
    });
}

function saveFile() {
    let code = editor.getModel().getValue();
    let path = filepath.innerHTML;
    if (path.charAt(path.length - 1) == "*") path = path.substring(0, path.length - 1);
    if (path == "") {
        saveFileAs();
        return;
    }
    fs.writeFile(path, code, (err) => {
        if (err) throw err;
    });
    filepath.innerHTML = path;
}

const loader = require('monaco-loader')
const highlighter = require('./languages/prolescript/highlighter');

var editor;

loader().then((monaco) => {
    monaco.editor.defineTheme('pride', {
        base: 'vs-dark', // can also be vs-dark or hc-black
        rules: [
            { token: '', background: '272727' }, //Sets the background colour of the minimap
            { token: 'comment', foreground: '008800', fontStyle: 'italic' },
            { token: 'identifier', foreground: 'a0a0a0' },
            { token: 'type', foreground: '0088ff' },
            { token: 'string', foreground: 'aa8800' },
            { token: 'number', foreground: 'ff0088' },
            { token: 'method', foreground: '00ff77' },
            { token: 'class', foreground: '00ffaa' },
            { token: 'punctuation', foreground: 'cdcdcd' },
            { token: 'keyword', foreground: '6666ee' },
            { token: 'operator', foreground: '00ffff' },
            { token: 'invalid', foreground: 'ff3333' },
        ]
    });

    monaco.languages.register({ id: "prolescript" });
    monaco.languages.setMonarchTokensProvider("prolescript", {
        defaultToken: 'invalid',
        tokenPostfix: '.prsc',

        keywords: [
            'for', 'foreach', 'while', 'if', 'elif', 'else', 'switch', 'case',
            'try', 'except', 'finally', 'class', 'public', 'private', 'return',
            'throw', 'break', 'in', 'true', 'false', 'null', 'import', 'self'
        ],

        typeKeywords: [
            'var', 'obj', 'list', 'dict', 'func'
        ],

        operators: [
            '=', '+=', '-=', '*=', '/=', '%=', '^=', '++', '--', '+', '-', '*', '/', '%', '^',
            '==', '!=', '<', '>', '<=', '>=', '!', 'and', 'or', 'xor'
        ],

        // we include these common regular expressions
        symbols: /[=><!~?:&|+\-*\/\^%]+/,
        escapes: /\\(?:[abfnrtv\\"'])/,

        // The main tokenizer for our languages
        tokenizer: {
            root: [
                { include: 'common' }
            ],

            common: [
                { include: 'whitespace' },

                [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                [/"/, 'string', '@string_double'],
                [/'/, 'string', '@string_single'],

                [/[,.<>!?"\+\-/*^\\|$&:;=()\[\]{}]/, 'punctuation'],
                [/\d+(\.?(\d+))*/, 'number'],
                [/[A-Za-z_][A-Za-z_0-9]*(?=\.)/, 'class'],
                [/[A-Za-z_][A-Za-z_0-9]*(?=\()/, {
                    cases: {
                        '@keywords': 'keyword',
                        '@default': 'method'
                    }
                }],
                [/[A-Za-z_][A-Za-z_0-9]*/, {
                    cases: {
                        '@typeKeywords': 'type',
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }],
            ],

            whitespace: [
                [/[ \t\r\n]+/, ''],
                [/\/\*\*(?!\/)/, 'comment.doc', '@proledoc'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment'],
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\*\//, 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ],

            proledoc: [
                [/[^\/*]+/, 'comment.doc'],
                [/\*\//, 'comment.doc', '@pop'],
                [/[\/*]/, 'comment.doc']
            ],

            string_double: [
                [/[^\\"]+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ],

            string_single: [
                [/[^\\']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/'/, 'string', '@pop']
            ],

            bracketCounting: [
                [/\{/, 'delimiter.bracket', '@bracketCounting'],
                [/\}/, 'delimiter.bracket', '@pop'],
                { include: 'common' }
            ],
        }
    });

    editor = monaco.editor.create(document.getElementById("editor"), {
        language: 'prolescript',
        theme: 'pride',
        lineNumbers: true,
        scrollBeyondLastLine: false,
    });

    window.addEventListener('resize', () => {
        editor.layout();
        editor.layout(); //We do this twice because in maximising it doesn't resize perfectly - but this fixes it (maybe make this better if you can though)
    });

    editor.onDidChangeModelContent((event) => {
        if (isopening) isopening = false;
        else {
            if (filepath.innerHTML.charAt(filepath.innerHTML.length - 1) != "*") filepath.innerHTML += "*";
        }
    });

    remote.getCurrentWindow().show();
});