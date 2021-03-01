
// Theme matching (i.e. applying a style to a token) happens in JavaScript.
// We must therefore register the theme rules in JavaScript.

// A custom theme must name its base theme (i.e. 'vs', 'vs-dark' or 'hc-black')
// It can then choose to inherit the rules from the base theme or not
// A rule token matching is prefix based: e.g.
//  - string will match a token with type: string, string.double.js or string.html
//  - string.double will match a token with type string.double but will not match string or string.html

// !!! Tokens can be inspected using F1 > Developer: Inspect Tokens !!!

monaco.editor.defineTheme('myCustomTheme', {
	base: 'vs-dark', // can also be vs-dark or hc-black
	rules: [
		{ token: 'comment', foreground: '008800', fontStyle: 'italic' },
        { token: 'identifier', foreground: 'ffffff' },
        { token: 'keyword', foreground: '6666ee' },
        { token: 'type', foreground: '0088ff' },
        { token: 'string', foreground: 'aa8800'},
        { token: 'number', foreground: 'ff0088'},
        { token: 'method', foreground: '00ff77'},
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

monaco.editor.create(document.getElementById("container"), {
	value: getCode(),
	language: "prolescript",
	theme: "myCustomTheme"
});

function getCode() {
	return `//example code of Prolescript
/*
and heres a multiline comment
*/

output("hello world");
var name = input("what's your name? ");
output($"hello {name}");

var a = 69;
a++;
if(a == 70){
    output('aight cool it\\'s 70\\n\\n or is it???? ');
}

class person{
    public var name;
    public func getName(){
        output(self.name);
    }
    
    person(var name){
        self.name = name;
    }
}

var me = person(name);
me.getName();`;
}
