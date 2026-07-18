import { tokenize } from './lexer.js';
import { parse } from './parser.js';
import { resolve } from './resolver.js';
import { generate } from './generator.js';
import { REGISTRY } from './registry.js';
import type { GeneratedOutput } from './generator.js';

export function compile(wflSource: string): GeneratedOutput {
  const tokens = tokenize(wflSource);
  const ast = parse(tokens);
  const resolved = resolve(ast, REGISTRY);
  return generate(resolved);
}

// CLI
const isCli = process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js');
if (isCli) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: wfl "nav::gls > btn::pri"');
    process.exit(1);
  }
  try {
    const result = compile(input);
    console.log('// Imports:');
    result.imports.forEach(i => console.log(`import { ${i.name} } from "${i.path}";`));
    console.log('\n// JSX:');
    console.log(result.jsx);
  } catch (err: any) {
    console.error('Compilation error:', err.message);
    process.exit(1);
  }
}
