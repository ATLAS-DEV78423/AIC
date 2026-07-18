import { tokenize } from './src/lexer.js';
const tokens = tokenize('btn::pri edi $bg::#000');
console.log(JSON.stringify(tokens, null, 2));
