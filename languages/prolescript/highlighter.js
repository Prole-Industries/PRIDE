const loader = require('monaco-loader');

async function main(){
    loader().then((monaco) => {
        monaco.editor.defineTheme('pride', {
            base: 'vs-dark', // can also be vs-dark or hc-black
            rules: [
                { token: 'comment', foreground: '008800', fontStyle: 'italic' },
                { token: 'identifier', foreground: 'f0f0f0' },
                { token: 'keyword', foreground: '00ffff' },
                { token: 'type', foreground: '569cd6' },
                { token: 'string', foreground: 'aa8800'},
                { token: 'number', foreground: 'ff0088'},
                { token: 'method', foreground: '00ffcc'},
                { token: 'class', foreground: '00ffaa'},
                { token: 'punctuation', foreground: 'cdcdcd'}
            ]
        });
        
        monaco.languages.register({id: "prolescript"});
        monaco.languages.setMonarchTokensProvider("prolescript", {
            defaultToken: 'invalid',
            tokenPostfix: '.prsc',
        
            keywords: [
              'for', 'foreach', 'while', 'if', 'elif', 'else', 'switch', 'case',
              'try', 'except', 'finally', 'class', 'func', 'public', 'private', 'return',
              'throw', 'break', 'in', 'true', 'false', 'null', 'import', 'self'
            ],
        
            typeKeywords: [
                'var', 'obj', 'list', 'dict'
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
        
                common : [
                    { include: 'whitespace' },
        
                    [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                    [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
                    [/"/, 'string', '@string_double'],
                    [/'/, 'string', '@string_single'],
        
                    [/[,.<>!?"\+\-/*^\\|$&:;=()\[\]{}]/, 'punctuation'],
                    [/\d+(\.?(\d+))/, 'number'],
                    [/[A-Za-z_][A-Za-z_0-9]*(?=\.)/, 'class'],
                    [/[A-Za-z_][A-Za-z_0-9]*(?=\()/, 'method'],
                    [/[A-Za-z_][A-Za-z_0-9]*/, {cases: {
                        '@typeKeywords': 'type',
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }}],
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
    });
}

module.exports = main;