# WFL Tailwind-Native Output Implementation Plan

> **REQUIRED SUB-SKILLS:** Use via superpowers:subagent-driven-development. Each task: implementer subagent → spec review → code quality review → commit.

**Goal:** WFL generates self-contained HTML + Tailwind CSS classes by default. Output renders immediately with just Tailwind CSS — no external component library needed.

**Architecture:** The registry IS the output format. Rewrite default registry entries to map WFL codes → HTML tag names + Tailwind utility class modifiers. Generator skips import tracking for native HTML elements. `--lib` flag preserves the old component-based output.

**Tech Stack:** TypeScript, React JSX, Tailwind CSS v3+ utility classes

**Reference designs:** shadcn/ui component patterns, Tailwind CSS documentation, existing CSS-in-JSX patterns

---

### Task 1: Generator — skip imports for native HTML elements

**Files:**
- Modify: `src/generator.ts:90-93`
- Test: `test/integration.test.ts`

The generator currently always collects imports. For native HTML elements (`button`, `nav`, `section`, etc.), no import is needed — React handles lowercase tags natively.

- [ ] **Step 1: Write the failing test**

Add to `test/integration.test.ts`:

```typescript
it('skips import for native HTML elements (empty importPath)', () => {
  // The default registry now sets importPath: '' for native tags
  const output = compile('btn::pri:"Click"');
  // No external component imports — only useState if state vars exist
  const extImports = output.imports.filter(i => i.path !== 'react');
  expect(extImports).toHaveLength(0);
  // Output uses native HTML tag
  expect(output.jsx).toContain('<button');
  expect(output.jsx).toContain('Click');
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run test/integration.test.ts -t "skips import"`
Expected: FAIL — output uses `<Button>` not `<button>`, and imports contain component paths.

- [ ] **Step 3: Add importPath guard in generator**

Change `src/generator.ts:90-93` from:
```typescript
  // Collect unique imports
  if (!imports.some(i => i.path === node.importPath && i.name === node.componentName)) {
    imports.push({ path: node.importPath, name: node.componentName });
  }
```
To:
```typescript
  // Collect unique imports — skip when importPath is empty (native HTML elements)
  if (node.importPath && !imports.some(i => i.path === node.importPath && i.name === node.componentName)) {
    imports.push({ path: node.importPath, name: node.componentName });
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/integration.test.ts -t "skips import"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/generator.ts test/integration.test.ts
git commit -m "fix(generator): skip import tracking for native HTML elements (empty importPath)"
```

> ✅ **Checkpoint 1:** Generator skips imports when `importPath` is empty. Passes test.

---

### Task 2: Rewrite default registry to HTML + Tailwind classes

**Files:**
- Rewrite: `src/registry.ts` (all entries)
- Do NOT change: `src/types.ts` (no type changes needed — existing fields suffice)

Each registry entry changes from:
```typescript
btn: {
  component: 'Button',          // React component name
  importPath: '@/components/ui/button',  // import path (doesn't exist)
  modifiers: {
    pri: { prop: 'variant', value: 'primary' },
  },
}
```
To:
```typescript
btn: {
  component: 'button',          // HTML tag name (lowercase = native)
  importPath: '',               // empty = no import needed
  modifiers: {
    pri: { className: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500' },
  },
}
```

Design principles for Tailwind classes:
1. **Follow shadcn/ui patterns** — well-proven, production-validated design decisions
2. **CSS variable-based** approach for themability (`bg-primary`), fallback to explicit (`bg-blue-600`) for zero-config
3. **Interactive states** included: `hover:`, `focus:`, `focus-visible:`, `disabled:`
4. **Responsive by default** — base mobile-first, add `md:`, `lg:` variants
5. **Animation-safe** — `transition-colors`, `transition-transform` where appropriate

- [ ] **Step 1: Write the output test FIRST**

Write `test/tailwind-output.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { compile, formatComponentOutput } from '../src/index';

describe('WFL Tailwind Output', () => {
  it('generates native HTML with Tailwind classes for btn::pri', () => {
    const output = compile('btn::pri:"Click"');
    expect(output.jsx).toContain('<button');
    expect(output.jsx).toContain('bg-blue-600');
    expect(output.jsx).toContain('Click');
    // No external component imports
    expect(output.imports.filter(i => i.path !== 'react')).toHaveLength(0);
  });

  it('generates nav with glass modifiers', () => {
    const output = compile('nav::gls::fix');
    expect(output.jsx).toContain('<nav');
    expect(output.jsx).toContain('backdrop-blur');
    expect(output.jsx).toContain('fixed');
  });

  it('generates stacked layout with semantic HTML', () => {
    const output = compile('stk::v > btn::pri:"A" ^ txt::h1:"B"');
    expect(output.jsx).toContain('<div'); // Stack renders as div
    expect(output.jsx).toContain('flex');
    expect(output.jsx).toContain('flex-col');
    expect(output.jsx).toContain('A');
    expect(output.jsx).toContain('B');
  });

  it('generates iteration with HTML elements', () => {
    const output = compile('*3 > card');
    expect(output.jsx).toContain('<div'); // Card = div
  });

  it('generates form elements with correct HTML tags', () => {
    const output = compile('inp::txt @query');
    expect(output.jsx).toContain('<input');
    expect(output.jsx).toContain('type="text"');
    expect(output.jsx).toContain('value={query}');
  });

  it('produces complete page output via formatComponentOutput', () => {
    const output = compile('btn::pri:"OK"');
    const file = formatComponentOutput(output);
    expect(file).toContain('export default function Page()');
    // No external component imports — only react if state exists
    expect(file).not.toContain('import { Button }');
    expect(file).toContain('<button');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run test/tailwind-output.test.ts`
Expected: FAIL — current registry still uses component paths.

- [ ] **Step 3: Rewrite registry.ts — first 10 entries (UI Components)**

Replace `btn`, `card`, `bge`, `ava`, `inp`, `sel`, `quote` entries:

```typescript
btn: {
  component: 'button',
  importPath: '',
  defaultProps: { type: 'button' },
  modifiers: {
    pri: { className: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
    sec: { className: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
    gh: { className: 'bg-transparent hover:bg-gray-100 text-gray-700 transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
    out: { className: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors inline-flex items-center justify-center font-medium h-10 px-4 py-2 rounded-md text-sm' },
    lg: { className: 'h-12 px-8 text-base rounded-lg' },
    sm: { className: 'h-8 px-3 text-xs rounded-md' },
    r: { className: 'rounded-full px-6' },
  },
  defaultContent: 'Button',
},
card: {
  component: 'div',
  importPath: '',
  defaultProps: {},
  modifiers: {
    out: { className: 'rounded-lg border border-gray-200 bg-white shadow-sm' },
    sm: { className: 'p-4' },
    lg: { className: 'p-8' },
    int: { className: 'bg-white shadow-md rounded-xl' },
  },
},
bge: {
  component: 'span',
  importPath: '',
  defaultProps: {},
  modifiers: {
    subtle: { className: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground bg-gray-100' },
    pri: { className: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-600 text-white' },
  },
},
ava: {
  component: 'span',
  importPath: '',
  defaultProps: {},
  modifiers: {
    sm: { className: 'relative inline-flex items-center justify-center rounded-full bg-gray-200 h-8 w-8' },
    lg: { className: 'relative inline-flex items-center justify-center rounded-full bg-gray-200 h-12 w-12' },
    md: { className: 'relative inline-flex items-center justify-center rounded-full bg-gray-200 h-10 w-10' },
  },
},
inp: {
  component: 'input',
  importPath: '',
  defaultProps: { type: 'text' },
  modifiers: {
    txt: { prop: 'type', value: 'text' },
    pwd: { prop: 'type', value: 'password' },
    eml: { prop: 'type', value: 'email' },
    num: { prop: 'type', value: 'number' },
  },
},
sel: {
  component: 'select',
  importPath: '',
  defaultProps: {},
  modifiers: {},
},
quote: {
  component: 'blockquote',
  importPath: '',
  defaultProps: {},
  modifiers: {},
},
```

- [ ] **Step 4: Run the Tailwind output test**

Run: `npx vitest run test/tailwind-output.test.ts`
Expected: Some tests pass. The `btn::pri` test should now pass since btn entry is Tailwind-native.

- [ ] **Step 5: Rewrite registry.ts — Layout & Typography (nav, sec, stk, txt, etc.)**

```typescript
nav: {
  component: 'nav',
  importPath: '',
  defaultProps: {},
  modifiers: {
    gls: { className: 'backdrop-blur-md bg-white/10 border-b' },
    fix: { className: 'fixed top-0 left-0 right-0 z-50 px-4 py-3' },
    dk: { className: 'bg-gray-900 text-white' },
    sticky: { className: 'sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b' },
  },
},
sec: {
  component: 'section',
  importPath: '',
  defaultProps: {},
  modifiers: {
    dk: { className: 'bg-gray-900 text-white' },
    hero: { className: 'min-h-screen flex items-center' },
  },
},
stk: {
  component: 'div',
  importPath: '',
  defaultProps: {},
  modifiers: {
    v: { className: 'flex flex-col' },
    h: { className: 'flex flex-row' },
    ctr: { className: 'items-center justify-center' },
    wrap: { className: 'flex-wrap' },
    gap: { className: 'gap-4' },
    gap2: { className: 'gap-8' },
  },
},
grd: {
  component: 'div',
  importPath: '',
  defaultProps: {},
  modifiers: {
    '2': { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
    '3': { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
    '4': { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
    auto: { className: 'grid grid-cols-auto-fill gap-4' },
  },
},
cnt: {
  component: 'div',
  importPath: '',
  defaultProps: {},
  modifiers: {
    mx: { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
    sm: { className: 'max-w-3xl mx-auto px-4' },
    lg: { className: 'max-w-screen-xl mx-auto px-4' },
  },
},
txt: {
  component: 'p',
  importPath: '',
  defaultProps: {},
  modifiers: {
    h1: { className: 'text-3xl font-bold tracking-tight sm:text-4xl' },
    h2: { className: 'text-2xl font-semibold tracking-tight' },
    h3: { className: 'text-xl font-semibold' },
    p: { className: 'text-base leading-7' },
    sub: { className: 'text-sm text-gray-500' },
    cen: { className: 'text-center' },
    xl: { className: 'text-lg' },
    muted: { className: 'text-gray-500' },
    bold: { className: 'font-bold' },
  },
},
h1: {
  component: 'h1',
  importPath: '',
  defaultProps: {},
  modifiers: {},
},
h2: {
  component: 'h2',
  importPath: '',
  defaultProps: {},
  modifiers: {},
},
h3: {
  component: 'h3',
  importPath: '',
  defaultProps: {},
  modifiers: {},
},
lnk: {
  component: 'a',
  importPath: '',
  defaultProps: {},
  modifiers: {
    pri: { className: 'text-blue-600 hover:text-blue-800 underline underline-offset-4' },
    sec: { className: 'text-gray-600 hover:text-gray-900 underline underline-offset-4' },
    nav: { className: 'text-sm font-medium hover:text-blue-600 transition-colors' },
  },
},
code: {
  component: 'code',
  importPath: '',
  defaultProps: {},
  modifiers: {
    block: { className: 'block bg-gray-100 rounded-lg p-4 text-sm overflow-x-auto' },
    inline: { className: 'bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono' },
  },
},
```

- [ ] **Step 6: Run tests — expect more passing**

Run: `npx vitest run test/tailwind-output.test.ts`
Expected: More tests pass. The nav/gls/fix and stk/txt tests should now work.

- [ ] **Step 7: Rewrite registry.ts — Media, Forms, Phase 1-2 components**

```typescript
img: {
  component: 'img',
  importPath: '',
  defaultProps: { alt: '' },
  modifiers: {
    rnd: { className: 'rounded-lg' },
    full: { className: 'w-full h-full object-cover' },
    circle: { className: 'rounded-full' },
    shadow: { className: 'shadow-lg' },
  },
},
icon: {
  component: 'span',
  importPath: '',
  defaultProps: {},
  modifiers: {
    sm: { className: 'inline-block h-4 w-4' },
    md: { className: 'inline-block h-5 w-5' },
    lg: { className: 'inline-block h-6 w-6' },
  },
},
hero: {
  component: 'section',
  importPath: '',
  defaultProps: {},
  modifiers: {
    cen: { className: 'w-full py-20 md:py-32 flex flex-col items-center text-center px-4' },
    left: { className: 'w-full py-20 md:py-32 px-4' },
    dk: { className: 'bg-gray-900 text-white' },
    split: { className: 'w-full py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center px-4' },
  },
},
feat: {
  component: 'section',
  importPath: '',
  defaultProps: {},
  modifiers: {
    '3': { className: 'w-full py-16 grid grid-cols-1 md:grid-cols-3 gap-8' },
    '2': { className: 'w-full py-16 grid grid-cols-1 md:grid-cols-2 gap-8' },
    '4': { className: 'w-full py-16 grid grid-cols-2 lg:grid-cols-4 gap-6' },
  },
},
cta: {
  component: 'section',
  importPath: '',
  defaultProps: {},
  modifiers: {
    cen: { className: 'w-full py-16 md:py-24 text-center px-4' },
    dk: { className: 'bg-gray-900 text-white' },
    lg: { className: 'py-24 px-8' },
  },
},
ft: {
  component: 'footer',
  importPath: '',
  defaultProps: {},
  modifiers: {
    dk: { className: 'bg-gray-900 text-white' },
    cen: { className: 'text-center' },
    sm: { className: 'py-8 text-sm' },
  },
},
tab: {
  component: 'div',
  importPath: '',
  defaultProps: {},
  modifiers: {
    h: { className: 'flex space-x-1 rounded-lg bg-gray-100 p-1' },
    v: { className: 'flex flex-col space-y-1' },
  },
},
lst: {
  component: 'ul',
  importPath: '',
  defaultProps: {},
  modifiers: {
    ul: { className: 'list-disc pl-6 space-y-2' },
    ol: { className: 'list-decimal pl-6 space-y-2' },
    none: { className: 'list-none p-0' },
    inline: { className: 'flex flex-wrap gap-2' },
  },
},
div: {
  component: 'hr',
  importPath: '',
  defaultProps: {},
  modifiers: {
    sm: { className: 'my-4 border-gray-200' },
    lg: { className: 'my-12 border-gray-200' },
  },
},
spn: {
  component: 'span',
  importPath: '',
  defaultProps: {},
  modifiers: {
    sm: { className: 'inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600' },
    lg: { className: 'inline-block h-8 w-8 animate-spin rounded-full border-3 border-gray-300 border-t-blue-600' },
    col: { className: 'text-current' },
  },
},
frm: {
  component: 'form',
  importPath: '',
  defaultProps: { method: 'POST' },
  modifiers: {},
},
lbl: {
  component: 'label',
  importPath: '',
  defaultProps: {},
  modifiers: {
    sm: { className: 'text-sm font-medium leading-none' },
    req: { className: 'after:content-["*"] after:ml-0.5 after:text-red-500' },
  },
},
txa: {
  component: 'textarea',
  importPath: '',
  defaultProps: { rows: 4 },
  modifiers: {
    sm: { prop: 'rows', value: 2 },
    lg: { prop: 'rows', value: 8 },
  },
},
chk: {
  component: 'input',
  importPath: '',
  defaultProps: { type: 'checkbox' },
  modifiers: {},
},
swt: {
  component: 'button',
  importPath: '',
  defaultProps: { role: 'switch', type: 'button' },
  modifiers: {
    sm: { className: 'h-4 w-8 rounded-full bg-gray-300 data-[state=checked]:bg-blue-600 transition-colors' },
    lg: { className: 'h-6 w-12 rounded-full bg-gray-300 data-[state=checked]:bg-blue-600 transition-colors' },
  },
},
rad: {
  component: 'div',
  importPath: '',
  defaultProps: {},
  modifiers: {
    h: { className: 'flex items-center space-x-4' },
    v: { className: 'flex flex-col space-y-3' },
  },
},
```

- [ ] **Step 8: Run all Tailwind output tests**

Run: `npx vitest run test/tailwind-output.test.ts`
Expected: All 6 tests pass.

- [ ] **Step 9: Add REGISTRY_LIB export**

Add at the top of registry.ts:

```typescript
// Component-based registry for --lib mode
import { Registry } from './types.js';

export const REGISTRY_LIB: Registry = { ... } // existing component entries go here
```

Export REGISTRY_LIB. The REGISTRY export becomes the Tailwind-based one.

- [ ] **Step 10: Full test run + benchmark check**

Run: `npx vitest run`
Expected: Existing tests that relied on component imports now fail. Count failures → update them in Task 4.

Run: `npx vitest run test/benchmark.test.ts`
Record the new compression ratio. Expected to drop slightly (Tailwind classes are more verbose than component props), but still ≥2.0×.

- [ ] **Step 11: Commit**

```bash
git add src/registry.ts test/tailwind-output.test.ts
git commit -m "feat(registry): rewrite to HTML + Tailwind classes, add REGISTRY_LIB"
```

> ✅ **Checkpoint 2:** Default registry outputs native HTML with Tailwind classes. `REGISTRY_LIB` preserves component mode. 6 new output tests pass.

---

### Task 3: Add --lib CLI flag for component mode

**Files:**
- Modify: `src/index.ts`
- Test: `test/integration.test.ts`

- [ ] **Step 1: Write test for --lib mode**

Add to `test/integration.test.ts`:

```typescript
it('--lib mode uses component registry with imports', () => {
  // Import REGISTRY_LIB directly
  const { REGISTRY_LIB } = await import('../src/registry');
  const output = compile('btn::pri:"Click"', REGISTRY_LIB);
  // Component mode generates React components with imports
  expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
  expect(output.jsx).toContain('<Button');
});
```

- [ ] **Step 2: Run to verify it fails (REGISTRY_LIB not exported yet)**

- [ ] **Step 3: Export REGISTRY_LIB from registry.ts**

```typescript
export const REGISTRY_LIB: Registry = { /* all old component entries */ };
```

Add after the REGISTRY export and before mergeRegistries.

- [ ] **Step 4: Add --lib handling to CLI**

In `src/index.ts` CLI section, add before the dispatch:

```typescript
// --lib flag switches to component-based registry
const libIdx = args.indexOf('--lib');
let useLib = false;
if (libIdx >= 0) {
  args.splice(libIdx, 1);
  useLib = true;
}

// Load custom registry if --registry flag is set
const regIdx = args.indexOf('--registry');
let registry: Registry | undefined;
if (regIdx >= 0 && args[regIdx + 1]) {
  const regPath = args[regIdx + 1];
  const regJson = JSON.parse(readFileSync(regPath, 'utf-8'));
  args.splice(regIdx, 2);
  registry = mergeRegistries(useLib ? REGISTRY_LIB : REGISTRY, regJson);
} else if (useLib) {
  registry = REGISTRY_LIB;
}
```

Update compile calls that use `reg` to pass `reg || (useLib ? REGISTRY_LIB : REGISTRY)`.

Wait — refactor the `compile` function itself to accept a mode. No — keep it simple: just change the default fallback.

Actually ponytail: the simplest approach is just variable assignment:

```typescript
const effectiveReg = registry || (useLib ? REGISTRY_LIB : REGISTRY);
```

And pass `effectiveReg` to `compile()`.

- [ ] **Step 5: Run test to verify --lib works**

Run: `npx vitest run test/integration.test.ts -t "--lib mode"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/registry.ts src/index.ts test/integration.test.ts
git commit -m "feat(cli): add --lib flag for component-based registry mode"
```

> ✅ **Checkpoint 3:** `--lib` flag uses REGISTRY_LIB for component output. Tailwind mode is default.

---

### Task 4: Update existing tests for Tailwind output

**Files:**
- Modify: `test/integration.test.ts`
- Modify: `test/edge-cases.test.ts`
- Potentially: `test/benchmark.test.ts` (threshold adjustments)

Update all tests that assert component imports or PascalCase component names.

- [ ] **Step 1: Update integration.test.ts**

Key changes needed:
- Remove or update assertions checking for `imports` with component paths (they're empty in Tailwind mode)
- Change `<Button` → `<button`, `<Navbar` → `<nav`, etc.
- Change `import { Button } from "@/components/ui/button"` → not present in Tailwind mode

Replace component-import tests with REGISTRY_LIB versions, OR just remove those assertions and check for HTML output.

Examples:
```typescript
// BEFORE:
it('compiles a nav+button end-to-end', () => {
  const output = compile('nav::gls::fix > btn::pri::r:"Get Started"');
  expect(output.imports).toContainEqual({ path: '@/components/layout/navbar', name: 'Navbar' });
  expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
  expect(output.jsx).toContain('<Navbar');
  expect(output.jsx).toContain('<Button');
  expect(output.jsx).toContain('Get Started');
});

// AFTER:
it('compiles a nav+button end-to-end', () => {
  const output = compile('nav::gls::fix > btn::pri::r:"Get Started"');
  // Tailwind output uses native HTML elements
  expect(output.jsx).toContain('<nav');
  expect(output.jsx).toContain('<button');
  expect(output.jsx).toContain('Get Started');
  expect(output.jsx).toContain('backdrop-blur');
  expect(output.jsx).toContain('rounded-full');
});
```

For tests that specifically test component mode behavior (imports, etc.), switch to using `REGISTRY_LIB`:

```typescript
it('compiles with custom registry', () => {
  const customReg: Registry = {
    greet: {
      component: 'Greeting',
      importPath: '@/components/custom/greeting',
      defaultProps: { message: 'Hello' },
      variantProps: {},
      modifiers: {},
    },
  };
  const output = compile('greet:"Hi"', customReg);
  // Custom registry entries have import paths → imports generated
  expect(output.imports).toContainEqual({ path: '@/components/custom/greeting', name: 'Greeting' });
  expect(output.jsx).toContain('Greeting');
  expect(output.jsx).toContain('Hi');
});
```

This test uses a custom registry with import paths, so it still checks imports. No change needed.

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: Updated tests pass. Count remaining failures and fix.

- [ ] **Step 3: Update edge-cases.test.ts**

Similar pattern — remove component import assertions, check for HTML tags + Tailwind classes instead.

- [ ] **Step 4: Run full suite again**

Run: `npx vitest run`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add test/integration.test.ts test/edge-cases.test.ts
git commit -m "test: update tests for Tailwind-native output"
```

> ✅ **Checkpoint 4:** All existing tests pass with new Tailwind output.

---

### Task 5: Code review, benchmark verification, and final polish

**Files:**
- Review: all modified files
- Check: test/benchmark.test.ts

- [ ] **Step 1: Benchmark check**

Run: `npx vitest run test/benchmark.test.ts`
Verify compression ratio. If below 2.0× threshold, adjust minimums.

Expected output format for benchmark report:
```
  Average compression: 2.85× across 8 expressions
```

Ratio may drop from 3.24× because Tailwind classes are more verbose than component variant props. Accept ≥2.0× minimum, adjust individual case thresholds.

- [ ] **Step 2: Code review — check registry.ts**

Check for:
- ✅ Consistent Tailwind class patterns (mobile-first, hover/focus states)
- ✅ No placeholder import paths
- ✅ All 35+ components have reasonable defaults
- ✅ Modifier classes compose correctly
- ✅ Empty string in importPath for native elements

- [ ] **Step 3: Code review — check generator.ts**

Check for:
- ✅ ImportPath guard works for native elements
- ✅ Component mode (REGISTRY_LIB) still generates imports
- ✅ className prop building still works
- ✅ State, events, iterations, conditionals all work with both modes

- [ ] **Step 4: Run final full test suite**

Run: `npx vitest run`
Expected: 313+ tests passing (some may be removed, new ones added).

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore: code review fixes + benchmark verification"
git push
```

> ✅ **Checkpoint 5:** All phases verified. Code reviewed. Benchmarked. Pushed.

---

## Rollback Plan

If the Tailwind output breaks any workflow:

```bash
git revert HEAD~4  # revert the last 4 commits (tasks 1-4)
git push
```

The `REGISTRY_LIB` export preserves the old behavior — users can always get it back via:
```typescript
import { REGISTRY_LIB } from 'wfl/registry';
compile(source, REGISTRY_LIB);
```

---

## Post-Implementation: Input & Services (phase separate from this plan)

After this plan is complete, the next phase covers:
- **Input system**: `@api(/endpoint)` data fetching, props passthrough, typed state
- **Service integration**: Built-in loading/error states for async data
- **Design**: Reference CSS, Tailwind, shadcn/ui patterns for the input system API

This phase is scoped separately per the scope check.
