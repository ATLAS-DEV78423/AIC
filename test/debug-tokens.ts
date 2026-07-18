import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { resolve } from '../src/resolver';
import { REGISTRY } from '../src/registry';

const r1 = tokenize('txt::h1:"Hello" ~fade ~slide300');
console.log('=== ANIMATION TOKENS ===');
r1.forEach(t => console.log(t.type, JSON.stringify(t.value), 'pos:', t.position));

const ast1 = parse(r1);
console.log('\n=== ANIMATION AST ===');
console.log('type:', ast1.type, 'element:', (ast1 as any).element);
console.log('modifiers:', JSON.stringify((ast1 as any).modifiers));
console.log('animations:', JSON.stringify((ast1 as any).animations));
console.log('content:', JSON.stringify((ast1 as any).content));

const resolved1 = resolve(ast1, REGISTRY);
console.log('\n=== ANIMATION RESOLVED ===');
console.log('componentName:', resolved1.componentName);
console.log('className:', JSON.stringify(resolved1.className));
console.log('animations:', JSON.stringify(resolved1.animations));

const r2 = tokenize('stk::v::ctr::gap > txt::h1:"A" ~fade ^ card::int:"B"');
console.log('\n=== ANIM + SIBLING TOKENS ===');
r2.forEach(t => console.log(t.type, JSON.stringify(t.value), 'pos:', t.position));

const ast2 = parse(r2);
console.log('\n=== ANIM + SIBLING AST ===');
console.log(JSON.stringify(ast2, null, 2));
