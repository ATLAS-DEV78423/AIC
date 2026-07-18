// Run: npx tsx test/validate-harness.ts
import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { resolve } from '../src/resolver';
import { generate } from '../src/generator';
import { REGISTRY } from '../src/registry';

interface TestScenario {
  name: string;
  wfl: string;
  expectedComponents: string[];
  minimumCompression: number; // generated chars / wfl chars
}

const scenarios: TestScenario[] = [
  {
    name: 'Simple button',
    wfl: 'btn::pri::lg:"Get Started"',
    expectedComponents: ['Button'],
    minimumCompression: 2,
  },
  {
    name: 'Navbar with button',
    wfl: 'nav::gls::fix > btn::pri::r:"Get Started"',
    expectedComponents: ['Navbar', 'Button'],
    minimumCompression: 2,
  },
  {
    name: 'Hero section',
    wfl: 'sec::hero::dk > stk::v::ctr > txt::h1::xl:"Build apps with AI"',
    expectedComponents: ['Section', 'Stack', 'Text'],
    minimumCompression: 2,
  },
  {
    name: 'Button with edit override',
    wfl: 'btn::pri edi $bg::#ff5733',
    expectedComponents: ['Button'],
    minimumCompression: 2,
  },
  {
    name: 'Stack with siblings',
    wfl: 'stk::v::ctr > bge::subtle:"Beta" ^ txt::h1:"Build" ^ txt::sub:"Ship"',
    expectedComponents: ['Stack', 'Badge', 'Text'],
    minimumCompression: 2,
  },
  {
    name: 'Animated hero page',
    wfl: 'sec::hero::dk > stk::v::ctr > txt::h1::xl ~fade:"Build with AI" ^ txt::sub ~slide:"Ship faster" ^ btn::pri::lg ~bounce:"Get Started"',
    expectedComponents: ['Section', 'Stack', 'Text', 'Button'],
    minimumCompression: 2,
  },
  {
    name: 'Iterated cards',
    wfl: '*3 > card > stk::v::ctr > txt::h1:"Item" ^ btn::pri:"View"',
    expectedComponents: ['Card', 'Stack', 'Text', 'Button'],
    minimumCompression: 2,
  },
  {
    name: 'Conditional avatar',
    wfl: '?@user | ava | btn::pri:"Login"',
    expectedComponents: ['Avatar', 'Button'],
    minimumCompression: 2,
  },
];

console.log('═'.repeat(60));
console.log('  WFL Validation Harness — Phase 1');
console.log('═'.repeat(60));

let passed = 0;
let failed = 0;

for (const scenario of scenarios) {
  console.log(`\n▶ Test: ${scenario.name}`);
  console.log(`  WFL: ${scenario.wfl.slice(0, 80)}${scenario.wfl.length > 80 ? '...' : ''}`);

  try {
    // Use character-length / 4 as LLM token proxy (consistent for WFL and JSX)
    const wflTokenProxy = Math.ceil(scenario.wfl.length / 4);

    // Parse
    const tokens = tokenize(scenario.wfl);
    console.log(`  Lexer tokens: ${tokens.length}`);

    // Build AST
    const ast = parse(tokens);

    // Resolve
    const resolved = resolve(ast, REGISTRY);

    // Generate
    const output = generate(resolved);
    const jsxTokenProxy = Math.ceil(output.jsx.length / 4);
    const compressionRatio = jsxTokenProxy / Math.max(wflTokenProxy, 1);

    console.log(`  Generated: ~${jsxTokenProxy} tokens (WFL: ~${wflTokenProxy})`);
    console.log(`  Compression: ${compressionRatio.toFixed(1)}:1`);
    console.log(`  Imports: ${output.imports.map(i => i.name).join(', ')}`);

    // Verify expected components are present
    const allNames = output.imports.map(i => i.name);
    const missing = scenario.expectedComponents.filter(c => !allNames.includes(c));
    if (missing.length > 0) {
      console.log(`  ✗ FAIL: Missing components: ${missing.join(', ')}`);
      failed++;
      continue;
    }

    // Verify compression ratio meets minimum
    if (compressionRatio < scenario.minimumCompression) {
      console.log(`  ✗ FAIL: Compression ${compressionRatio.toFixed(1)}:1 < ${scenario.minimumCompression}:1`);
      failed++;
      continue;
    }

    console.log(`  ✓ PASS`);
    passed++;
  } catch (err: any) {
    console.log(`  ✗ FAIL: ${err.message}`);
    failed++;
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`  Results: ${passed} passed, ${failed} failed out of ${scenarios.length}`);
console.log(`${'═'.repeat(60)}`);

process.exit(failed > 0 ? 1 : 0);
