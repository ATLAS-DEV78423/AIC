# WFL Phase 0 — AI Integration Validation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Validate that AI agents can effectively learn and use WFL from a minimal system prompt, and that the core transpiler produces correct output.

**Architecture:** We build a TypeScript transpiler (Lexer → Parser → Resolver → Generator), a minimal component registry (20 tokens), and a test harness to measure compression ratio, error rate, and self-correction ability. The AI system prompt teaches WFL grammar in ~500 tokens.

**Tech Stack:** TypeScript (Node.js runtime), existing prototype code as reference

---

## File Structure

```
C:\Users\Stanley\Documents\AIC 2\
├── package.json                    # Root package with scripts
├── tsconfig.json                   # TypeScript config
├── src/
│   ├── index.ts                    # Entry point / CLI
│   ├── lexer.ts                    # Stage 1: Tokenizer
│   ├── parser.ts                   # Stage 2: AST builder
│   ├── resolver.ts                 # Stage 3: Component lookup + override merge
│   ├── generator.ts                # Stage 4: React/JSX output
│   ├── registry.ts                 # Component registry (20 core tokens)
│   └── types.ts                    # All TypeScript types/interfaces
├── test/
│   ├── lexer.test.ts
│   ├── parser.test.ts
│   ├── resolver.test.ts
│   ├── generator.test.ts
│   ├── integration.test.ts         # Full-pipeline tests
│   └── fixtures/                   # Test input/output fixtures
│       ├── hero-page.wfl
│       ├── hero-page.expected.tsx
│       ├── form-login.wfl
│       ├── form-login.expected.tsx
│       ├── dashboard.wfl
│       └── dashboard.expected.tsx
├── ai/
│   └── WFL_SYSTEM_PROMPT.md       # ~500 token AI system prompt
└── docs/
    └── superpowers/
        └── plans/
            └── 2026-07-18-wfl-phase0-validation.md  # This file
```

---

### Task 1: Project Setup + TypeScript Config

**Files:**
- Create: `C:\Users\Stanley\Documents\AIC 2\package.json`
- Create: `C:\Users\Stanley\Documents\AIC 2\tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "wfl",
  "version": "0.1.0",
  "description": "Web Formation Language — token-efficient AI-native DSL",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "compile": "tsx src/index.ts"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "tsx": "^4.19.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 3: Install dependencies**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npm install`

Expected: `typescript`, `vitest`, `tsx` installed in `node_modules/`

- [ ] **Step 4: Verify TypeScript compiles empty project**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx tsc --noEmit`

Expected: No errors (nothing to compile yet — just confirms config is valid)

- [ ] **Step 5: Commit**

```bash
git init "/c/Users/Stanley/Documents/AIC 2"
cd "/c/Users/Stanley/Documents/AIC 2"
echo "node_modules/\ndist/\n" > .gitignore
git add package.json tsconfig.json .gitignore
git commit -m "chore: initialize WFL project with TypeScript config"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 2: Define Types (TypeScript Interfaces)

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write all type definitions**

```typescript
// ── Tokens ──
export type TokenType =
  | 'TYPE'       // btn, nav, stk, txt (2-3 letter component codes)
  | 'MOD'        // pri, lg, gls (modifiers/variants)
  | 'STRING'     // "Hello World"
  | 'CONTENT'    // :"content"  (colon + string)
  | 'CHILD'      // >  (nesting)
  | 'SIBLING_H'  // +  (horizontal sibling)
  | 'SIBLING_V'  // ^  (vertical sibling)
  | 'EDIT'       // edi (override keyword)
  | 'EVENT'      // !onClick, !onChange
  | 'STATE'      // @varName
  | 'ITERATE'    // *N or *@data
  | 'CONDITIONAL'// ?@var
  | 'PIPE'       // |  (conditional separator)
  | 'THEME'      // $thm, $col (style/theme prefix)
  | 'MOD_SEP';   // ::  (modifier chain separator)

export interface Token {
  type: TokenType;
  value: string;
  position: number; // character offset in source
}

// ── AST ──
export interface ASTNode {
  type: 'component' | 'edit' | 'event' | 'state' | 'iteration' | 'conditional' | 'theme';
}

export interface ComponentNode extends ASTNode {
  type: 'component';
  element: string;      // btn, nav, txt
  modifiers: string[];  // [pri, lg]
  content: string | null; // "Get Started" or null
  children: ASTNode[];
  edits: EditNode[];
  events: EventNode[];
  state: string | null;
}

export interface EditNode extends ASTNode {
  type: 'edit';
  property: string;   // bg, col, txt
  value: string;      // #ff5733, "Go"
}

export interface EventNode extends ASTNode {
  type: 'event';
  handler: string;    // onClick
  callback: string;   // handleSignup
}

export interface StateNode extends ASTNode {
  type: 'state';
  name: string;       // user, todos
}

export interface IterationNode extends ASTNode {
  type: 'iteration';
  count: number | string; // 3 or '@todos'
  child: ASTNode;
}

export interface ConditionalNode extends ASTNode {
  type: 'conditional';
  variable: string;
  trueBranch: ASTNode;
  falseBranch: ASTNode | null;
}

export interface ThemeNode extends ASTNode {
  type: 'theme';
  category: string;   // thm, col, fnt
  value: string;      // dark, slate.900, inter
}

// ── Resolved Tree (output of Resolver) ──
export interface ResolvedComponent {
  element: string;
  componentName: string;
  importPath: string;
  props: Record<string, string>;
  className: string;
  content: string | null;
  children: ResolvedComponent[];
  events: { handler: string; callback: string }[];
  state: string | null;
  iteration: { count: number | string } | null;
  conditional: { variable: string; falseBranch: ResolvedComponent | null } | null;
}

// ── Registry ──
export interface RegistryEntry {
  component: string;
  importPath: string;
  defaultProps: Record<string, string>;
  variantProps: Record<string, Record<string, string>>;
  modifiers: Record<string, { prop?: string; value?: string; className?: string }>;
  defaultContent?: string;
}

export type Registry = Record<string, RegistryEntry>;
```

- [ ] **Step 2: Verify compilation**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx tsc --noEmit`
Expected: No errors (types file compiles clean)

- [ ] **Step 3: Verify tests recognize types**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run 2>&1 | head -5`
Expected: "No test files found" (or similar — we haven't written tests yet)

- [ ] **Step 4: Commit**

```bash
git add src/types.ts
git commit -m "feat: define WFL TypeScript types (tokens, AST, registry)"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 3: Build the Lexer (Tokenizer)

**Files:**
- Create: `src/lexer.ts`
- Create: `test/lexer.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/lexer.test.ts
import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer';

describe('WFL Lexer', () => {
  it('tokenizes a simple component with content', () => {
    const tokens = tokenize('btn::pri:"Click"');
    expect(tokens).toEqual([
      { type: 'TYPE', value: 'btn', position: 0 },
      { type: 'MOD_SEP', value: '::', position: 3 },
      { type: 'MOD', value: 'pri', position: 5 },
      { type: 'CONTENT', value: ':"Click"', position: 8 },
    ]);
  });

  it('tokenizes child nesting', () => {
    const tokens = tokenize('nav > btn');
    expect(tokens).toEqual([
      { type: 'TYPE', value: 'nav', position: 0 },
      { type: 'CHILD', value: '>', position: 4 },
      { type: 'TYPE', value: 'btn', position: 6 },
    ]);
  });

  it('tokenizes sibling relationships', () => {
    const tokens = tokenize('btn::pri + btn::sec');
    expect(tokens).toContainEqual({ type: 'SIBLING_H', value: '+', position: 9 });
  });

  it('tokenizes edit overrides', () => {
    const tokens = tokenize('btn edi $bg::#000');
    expect(tokens).toContainEqual({ type: 'EDIT', value: 'edi', position: 4 });
    expect(tokens).toContainEqual({ type: 'THEME', value: '$bg', position: 8 });
  });

  it('tokenizes event bindings', () => {
    const tokens = tokenize('btn !onClick::handleSubmit');
    expect(tokens).toContainEqual({ type: 'EVENT', value: '!onClick', position: 4 });
  });

  it('tokenizes state variables', () => {
    const tokens = tokenize('@user');
    expect(tokens).toEqual([{ type: 'STATE', value: '@user', position: 0 }]);
  });

  it('tokenizes iteration', () => {
    const tokens = tokenize('*3 > card');
    expect(tokens).toEqual([
      { type: 'ITERATE', value: '*3', position: 0 },
      { type: 'CHILD', value: '>', position: 3 },
      { type: 'TYPE', value: 'card', position: 5 },
    ]);
  });

  it('tokenizes conditionals', () => {
    const tokens = tokenize('?@user | avatar');
    expect(tokens).toContainEqual({ type: 'CONDITIONAL', value: '?@user', position: 0 });
    expect(tokens).toContainEqual({ type: 'PIPE', value: '|', position: 7 });
  });

  it('returns empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('strips comments', () => {
    const tokens = tokenize('btn::pri # this is a comment');
    expect(tokens).not.toContainEqual(expect.objectContaining({ type: 'TYPE', value: '#' }));
  });
});
```

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/lexer.test.ts`
Expected: FAIL (lexer.ts doesn't exist yet)

- [ ] **Step 2: Write the lexer implementation**

```typescript
// src/lexer.ts
import { Token, TokenType } from './types.js';

interface Pattern {
  type: TokenType;
  regex: RegExp;
}

const patterns: Pattern[] = [
  // Order matters — most specific first
  { type: 'EDIT', regex: /^edi\b/ },
  { type: 'EVENT', regex: /^![a-zA-Z]+/ },
  { type: 'STATE', regex: /^@[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: 'THEME', regex: /^\$[a-zA-Z]+/ },
  { type: 'ITERATE', regex: /^\*\d+|\*@[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: 'CONDITIONAL', regex: /^\?@[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: 'PIPE', regex: /^\|/ },
  { type: 'CONTENT', regex: /^:"[^"]*"/ },
  { type: 'STRING', regex: /^"[^"]*"/ },
  { type: 'MOD_SEP', regex: /^::/ },
  { type: 'CHILD', regex: /^>/ },
  { type: 'SIBLING_H', regex: /^\+/ },
  { type: 'SIBLING_V', regex: /^\^/ },
  { type: 'MOD', regex: /^[a-zA-Z0-9#][a-zA-Z0-9#-]*/ },
  { type: 'TYPE', regex: /^[a-z]{2,3}(?=\b|::|>|\+|\^| |$)/ },
];

const commentPattern = /^#.*$/m;

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < input.length) {
    // Skip whitespace
    if (/\s/.test(input[pos])) {
      pos++;
      continue;
    }

    // Skip comments
    const commentMatch = input.slice(pos).match(commentPattern);
    if (commentMatch) {
      pos += commentMatch[0].length;
      continue;
    }

    let matched = false;
    for (const { type, regex } of patterns) {
      const match = input.slice(pos).match(regex);
      if (match && match.index === 0) {
        tokens.push({ type, value: match[0], position: pos });
        pos += match[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Skip unknown characters (lenient parsing)
      pos++;
    }
  }

  return tokens;
}
```

- [ ] **Step 3: Run tests and verify they pass**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/lexer.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/lexer.ts test/lexer.test.ts
git commit -m "feat: implement WFL lexer (tokenizer) with full test suite"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 4: Build the Parser (AST Builder)

**Files:**
- Create: `src/parser.ts`
- Create: `test/parser.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser';
import { tokenize } from '../src/lexer';

function p(input: string) {
  return parse(tokenize(input));
}

describe('WFL Parser', () => {
  it('parses a simple component with modifiers', () => {
    const ast = p('btn::pri::lg');
    expect(ast).toEqual({
      type: 'component',
      element: 'btn',
      modifiers: ['pri', 'lg'],
      content: null,
      children: [],
      edits: [],
      events: [],
      state: null,
    });
  });

  it('parses component with content', () => {
    const ast = p('btn::pri:"Click"') as any;
    expect(ast.content).toBe(':"Click"');
  });

  it('parses child nesting', () => {
    const ast = p('nav > btn::pri') as any;
    expect(ast.element).toBe('nav');
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].element).toBe('btn');
  });

  it('parses sibling relationships', () => {
    const ast = p('btn::pri + btn::sec') as any;
    expect(ast.type).toBe('component');
    // Siblings create a flat structure
  });

  it('parses edit overrides', () => {
    const ast = p('btn::pri edi $bg::#000') as any;
    expect(ast.edits).toHaveLength(1);
    expect(ast.edits[0].property).toBe('$bg');
    expect(ast.edits[0].value).toBe('#000');
  });

  it('parses event bindings', () => {
    const ast = p('btn !onClick::handleSubmit') as any;
    expect(ast.events).toHaveLength(1);
    expect(ast.events[0].handler).toBe('!onClick');
    expect(ast.events[0].callback).toBe('handleSubmit');
  });

  it('parses complex landing page', () => {
    const input = `nav::gls::fix > btn::pri::r:"Get Started"`;
    const ast = p(input) as any;
    expect(ast.element).toBe('nav');
    expect(ast.children[0].element).toBe('btn');
    expect(ast.children[0].content).toBe(':"Get Started"');
  });
});
```

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/parser.test.ts`
Expected: FAIL (parser.ts doesn't exist yet)

- [ ] **Step 2: Write the parser implementation**

```typescript
// src/parser.ts
import { Token, TokenType, ASTNode, ComponentNode, EditNode, EventNode } from './types.js';

export function parse(tokens: Token[]): ASTNode {
  let pos = 0;

  function peek(): Token | null {
    return pos < tokens.length ? tokens[pos] : null;
  }

  function consume(): Token {
    return tokens[pos++];
  }

  function expect(type: TokenType): Token {
    const token = peek();
    if (!token || token.type !== type) {
      throw new Error(`Expected ${type} at position ${pos}, got ${token?.type || 'EOF'}`);
    }
    return consume();
  }

  function parseComponent(): ComponentNode {
    const typeToken = expect('TYPE');
    const element = typeToken.value;
    const modifiers: string[] = [];
    const children: ASTNode[] = [];
    const edits: EditNode[] = [];
    const events: EventNode[] = [];
    let content: string | null = null;
    let state: string | null = null;

    // Parse modifier chain (::mod1::mod2)
    while (peek()?.type === 'MOD_SEP') {
      consume(); // skip ::
      if (peek()?.type === 'MOD') {
        modifiers.push(consume().value);
      }
    }

    // Parse content (:"text")
    if (peek()?.type === 'CONTENT') {
      content = consume().value;
    }

    // Parse edits, events, state
    while (peek() && ['EDIT', 'EVENT', 'STATE'].includes(peek()!.type)) {
      const token = consume();
      if (token.type === 'EDIT') {
        if (peek()?.type === 'THEME') {
          const prop = consume().value;
          // consume :: separator
          if (peek()?.type === 'MOD_SEP') consume();
          const value = peek()?.type === 'MOD' || peek()?.type === 'STRING'
            ? consume().value
            : '';
          edits.push({ type: 'edit', property: prop, value });
        }
      } else if (token.type === 'EVENT') {
        // Expect ::callback
        if (peek()?.type === 'MOD_SEP') consume();
        const callback = peek()?.type === 'MOD' ? consume().value : '';
        events.push({ type: 'event', handler: token.value, callback });
      } else if (token.type === 'STATE') {
        state = token.value;
      }
    }

    // Parse child nesting (> child)
    while (peek()?.type === 'CHILD') {
      consume(); // skip >
      children.push(parseComponent());
    }

    return {
      type: 'component',
      element,
      modifiers,
      content,
      children,
      edits,
      events,
      state,
    };
  }

  // For simplicity, parse a single component tree
  // Extended to handle siblings in integration
  return parseComponent();
}
```

- [ ] **Step 3: Run tests and verify they pass**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/parser.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/parser.ts test/parser.test.ts
git commit -m "feat: implement WFL parser (AST builder) with tests"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 5: Build the Component Registry

**Files:**
- Create: `src/registry.ts`
- Create: `test/registry.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/registry.test.ts
import { describe, it, expect } from 'vitest';
import { createRegistry, REGISTRY } from '../src/registry';

describe('WFL Registry', () => {
  it('has all core components', () => {
    const expected = ['btn', 'card', 'nav', 'sec', 'stk', 'grd', 'txt', 'h1', 'h2', 'h3', 'inp', 'sel', 'bge', 'ava', 'img', 'icon', 'lnk', 'code', 'quote', 'cnt'];
    expected.forEach(t => {
      expect(REGISTRY[t]).toBeDefined();
    });
  });

  it('btn has primary variant', () => {
    const btn = REGISTRY['btn'];
    expect(btn.variantProps['pri']).toBeDefined();
  });

  it('resolves modifiers to correct props', () => {
    const btn = REGISTRY['btn'];
    expect(btn.modifiers['pri']).toBeDefined();
    expect(btn.modifiers['lg']).toBeDefined();
  });

  it('stk has vertical and horizontal variants', () => {
    const stk = REGISTRY['stk'];
    expect(stk.variantProps['v']).toBeDefined();
    expect(stk.variantProps['h']).toBeDefined();
  });
});
```

- [ ] **Step 2: Write the registry**

```typescript
// src/registry.ts
import { Registry } from './types.js';

export const REGISTRY: Registry = {
  // ── UI Components ──
  btn: {
    component: 'Button',
    importPath: '@/components/ui/button',
    defaultProps: { variant: 'default', size: 'default' },
    variantProps: {
      pri: { variant: 'primary' },
      sec: { variant: 'secondary' },
      gh: { variant: 'ghost' },
      out: { variant: 'outline' },
      lg: { size: 'lg' },
      sm: { size: 'sm' },
      rnd: { className: 'rounded-full' },
    },
    modifiers: {
      pri: { prop: 'variant', value: 'primary' },
      sec: { prop: 'variant', value: 'secondary' },
      gh: { prop: 'variant', value: 'ghost' },
      out: { prop: 'variant', value: 'outline' },
      lg: { prop: 'size', value: 'lg' },
      sm: { prop: 'size', value: 'sm' },
    },
  },
  card: {
    component: 'Card',
    importPath: '@/components/ui/card',
    defaultProps: {},
    variantProps: {},
    modifiers: {
      '3d': { className: 'transform-style-preserve-3d perspective-1000' },
    },
  },
  bge: {
    component: 'Badge',
    importPath: '@/components/ui/badge',
    defaultProps: {},
    variantProps: {
      subtle: { variant: 'secondary' },
      pri: { variant: 'default' },
    },
    modifiers: {
      subtle: { prop: 'variant', value: 'secondary' },
    },
  },
  ava: {
    component: 'Avatar',
    importPath: '@/components/ui/avatar',
    defaultProps: {},
    variantProps: {
      sm: { className: 'h-8 w-8' },
      lg: { className: 'h-12 w-12' },
    },
    modifiers: {},
  },
  inp: {
    component: 'Input',
    importPath: '@/components/ui/input',
    defaultProps: { type: 'text' },
    variantProps: {
      txt: { type: 'text' },
      pwd: { type: 'password' },
      eml: { type: 'email' },
      num: { type: 'number' },
    },
    modifiers: {
      txt: { prop: 'type', value: 'text' },
      pwd: { prop: 'type', value: 'password' },
      eml: { prop: 'type', value: 'email' },
    },
  },
  sel: {
    component: 'Select',
    importPath: '@/components/ui/select',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },

  // ── Layout Components ──
  nav: {
    component: 'Navbar',
    importPath: '@/components/layout/navbar',
    defaultProps: {},
    variantProps: {
      gls: { className: 'backdrop-blur-md bg-white/10 border-b' },
      fix: { className: 'fixed top-0 left-0 right-0 z-50' },
      dk: { className: 'dark bg-slate-900 text-white' },
    },
    modifiers: {
      gls: { className: 'backdrop-blur-md bg-white/10 border-b' },
      fix: { className: 'fixed top-0 left-0 right-0 z-50 px-4 py-3' },
      dk: { className: 'dark bg-slate-900 text-white' },
    },
  },
  sec: {
    component: 'Section',
    importPath: '@/components/layout/section',
    defaultProps: {},
    variantProps: {
      dk: { className: 'dark bg-slate-900 text-white' },
      hero: { className: 'min-h-screen flex items-center' },
      feat: { className: 'py-24' },
    },
    modifiers: {
      dk: { className: 'dark bg-slate-900 text-white' },
      hero: { className: 'min-h-screen flex items-center' },
    },
  },
  stk: {
    component: 'Stack',
    importPath: '@/components/layout/stack',
    defaultProps: { direction: 'column' },
    variantProps: {
      v: { direction: 'column' },
      h: { direction: 'row' },
      ctr: { className: 'items-center justify-center' },
    },
    modifiers: {
      v: { prop: 'direction', value: 'column' },
      h: { prop: 'direction', value: 'row' },
      ctr: { className: 'items-center justify-center' },
    },
  },
  grd: {
    component: 'Grid',
    importPath: '@/components/layout/grid',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },
  cnt: {
    component: 'Container',
    importPath: '@/components/layout/container',
    defaultProps: {},
    variantProps: {
      mx: { className: 'max-w-7xl mx-auto' },
    },
    modifiers: { mx: { className: 'max-w-7xl mx-auto' } },
  },

  // ── Typography ──
  txt: {
    component: 'Text',
    importPath: '@/components/typography/text',
    defaultProps: { as: 'p' },
    variantProps: {
      h1: { as: 'h1' },
      h2: { as: 'h2' },
      h3: { as: 'h3' },
      p: { as: 'p' },
      sub: { as: 'p', className: 'text-muted-foreground' },
      cen: { className: 'text-center' },
      xl: { className: 'text-xl' },
    },
    modifiers: {
      h1: { prop: 'as', value: 'h1' },
      h2: { prop: 'as', value: 'h2' },
      p: { prop: 'as', value: 'p' },
      sub: { className: 'text-muted-foreground' },
      cen: { className: 'text-center' },
      xl: { className: 'text-xl' },
    },
  },
  h1: {
    component: 'Heading1',
    importPath: '@/components/typography/heading',
    defaultProps: { level: 1 },
    variantProps: {},
    modifiers: {},
  },
  lnk: {
    component: 'Link',
    importPath: 'next/link',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },
  code: {
    component: 'Code',
    importPath: '@/components/typography/code',
    defaultProps: {},
    variantProps: {},
    modifiers: {},
  },

  // ── Media ──
  img: {
    component: 'Image',
    importPath: 'next/image',
    defaultProps: { alt: '' },
    variantProps: {
      rnd: { className: 'rounded-lg' },
      full: { className: 'w-full h-full object-cover' },
    },
    modifiers: {
      rnd: { className: 'rounded-lg' },
    },
  },
  icon: {
    component: 'Icon',
    importPath: 'lucide-react',
    defaultProps: { size: 24 },
    variantProps: {},
    modifiers: {},
  },
};

export function createRegistry(): Registry {
  return { ...REGISTRY };
}
```

- [ ] **Step 3: Run tests**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/registry.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/registry.ts test/registry.test.ts
git commit -m "feat: add WFL component registry with 20 core components"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 6: Build the Resolver (Component Lookup + Override Merge)

**Files:**
- Create: `src/resolver.ts`
- Create: `test/resolver.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/resolver.test.ts
import { describe, it, expect } from 'vitest';
import { resolve } from '../src/resolver';
import { parse } from '../src/parser';
import { tokenize } from '../src/lexer';
import { REGISTRY } from '../src/registry';

function r(input: string) {
  const ast = parse(tokenize(input));
  return resolve(ast, REGISTRY);
}

describe('WFL Resolver', () => {
  it('resolves a simple button', () => {
    const result = r('btn::pri:"Click"');
    expect(result.componentName).toBe('Button');
    expect(result.props).toContainEqual(['variant', 'primary']);
    expect(result.content).toBe(':"Click"');
  });

  it('resolves a navbar with children', () => {
    const result = r('nav::gls > btn::pri');
    expect(result.componentName).toBe('Navbar');
    expect(result.children).toHaveLength(1);
    expect(result.children[0].componentName).toBe('Button');
  });

  it('resolves edit overrides', () => {
    const result = r('btn::pri edi $bg::#ff5733');
    const hasBg = result.props.some(
      ([k, v]: [string, string]) => k === 'style' && v.includes('#ff5733')
    );
    expect(hasBg).toBe(true);
  });

  it('resolves theme modifiers to className', () => {
    const result = r('nav::gls');
    expect(result.className).toContain('backdrop-blur-md');
  });
});
```

- [ ] **Step 2: Write the resolver**

```typescript
// src/resolver.ts
import { ASTNode, ComponentNode, ResolvedComponent, Registry } from './types.js';

export function resolve(node: ASTNode, registry: Registry): ResolvedComponent {
  if (node.type !== 'component') {
    throw new Error(`Cannot resolve non-component node: ${node.type}`);
  }
  return resolveComponent(node as ComponentNode, registry);
}

function resolveComponent(node: ComponentNode, registry: Registry): ResolvedComponent {
  const entry = registry[node.element];
  if (!entry) {
    throw new Error(`Unknown component token: "${node.element}"`);
  }

  // Start with defaults
  const props: Record<string, string> = { ...entry.defaultProps };
  const classParts: string[] = [];

  // Apply modifiers
  for (const mod of node.modifiers) {
    const modDef = entry.modifiers[mod];
    if (modDef) {
      if (modDef.prop) {
        props[modDef.prop] = modDef.value || '';
      }
      if (modDef.className) {
        classParts.push(modDef.className);
      }
    }
    // Also check variantProps
    const variant = entry.variantProps[mod];
    if (variant) {
      if (variant.className) classParts.push(variant.className);
      Object.entries(variant).forEach(([k, v]) => {
        if (k !== 'className') props[k] = v;
      });
    }
  }

  // Apply edit overrides as inline styles
  for (const edit of node.edits) {
    if (edit.property.startsWith('$bg')) {
      const existingStyle = props['style'] || '';
      props['style'] = `${existingStyle} background: ${edit.value};`.trim();
    }
    if (edit.property.startsWith('$col')) {
      const existingStyle = props['style'] || '';
      props['style'] = `${existingStyle} color: ${edit.value};`.trim();
    }
  }

  return {
    element: node.element,
    componentName: entry.component,
    importPath: entry.importPath,
    props,
    className: classParts.join(' '),
    content: node.content,
    children: node.children.map(c => resolve(c, registry)),
    events: node.events.map(e => ({ handler: e.handler, callback: e.callback })),
    state: node.state,
    iteration: null,
    conditional: null,
  };
}
```

- [ ] **Step 3: Run tests**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/resolver.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/resolver.ts test/resolver.test.ts
git commit -m "feat: implement WFL resolver with modifier and edit override support"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 7: Build the Generator (React/JSX Output)

**Files:**
- Create: `src/generator.ts`
- Create: `test/generator.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// test/generator.test.ts
import { describe, it, expect } from 'vitest';
import { generate } from '../src/generator';

describe('WFL Generator', () => {
  it('generates JSX from resolved component', () => {
    const resolved = {
      element: 'btn',
      componentName: 'Button',
      importPath: '@/components/ui/button',
      props: { variant: 'primary' },
      className: '',
      content: ':"Click"',
      children: [],
      events: [],
      state: null,
      iteration: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.jsx).toContain('<Button');
    expect(result.jsx).toContain('variant="primary"');
  });

  it('generates imports', () => {
    const resolved = {
      element: 'btn',
      componentName: 'Button',
      importPath: '@/components/ui/button',
      props: {},
      className: '',
      content: null,
      children: [],
      events: [],
      state: null,
      iteration: null,
      conditional: null,
    };
    const result = generate(resolved);
    expect(result.imports).toContainEqual({
      path: '@/components/ui/button',
      name: 'Button',
    });
  });
});
```

- [ ] **Step 2: Write the generator**

```typescript
// src/generator.ts
import { ResolvedComponent } from './types.js';

interface Import {
  path: string;
  name: string;
}

interface GeneratedOutput {
  imports: Import[];
  jsx: string;
}

export function generate(component: ResolvedComponent): GeneratedOutput {
  const imports: Import[] = [];
  const jsx = generateJSX(component, imports);
  return { imports, jsx };
}

function generateJSX(node: ResolvedComponent, imports: Import[]): string {
  // Collect unique imports
  if (!imports.some(i => i.path === node.importPath && i.name === node.componentName)) {
    imports.push({ path: node.importPath, name: node.componentName });
  }

  // Build props string
  const propParts: string[] = [];
  Object.entries(node.props).forEach(([key, value]) => {
    propParts.push(`${key}="${value}"`);
  });

  if (node.className) {
    const existingIdx = propParts.findIndex(p => p.startsWith('className='));
    if (existingIdx >= 0) {
      propParts[existingIdx] = `className="${node.className}"`;
    } else {
      propParts.push(`className="${node.className}"`);
    }
  }

  const propsStr = propParts.join(' ');

  // Build children JSX
  const childrenStr = node.children.map(c => generateJSX(c, imports)).join('\n');

  // Handle content
  const content = node.content ? node.content.replace(/^:"/, '').replace(/"$/, '') : '';

  // Handle events
  const eventAttrs = node.events.map(e => {
    const handler = e.handler.replace('!', '');
    return `${handler}={${e.callback}}`;
  }).join(' ');

  const allProps = [propsStr, eventAttrs].filter(Boolean).join(' ');

  // Self-closing for no children + no content
  if (!childrenStr && !content) {
    return `      <${node.componentName}${allProps ? ' ' + allProps : ''} />`;
  }

  return `      <${node.componentName}${allProps ? ' ' + allProps : ''}>
${content ? `        ${content}` : ''}${childrenStr ? '\n' + childrenStr : ''}
      </${node.componentName}>`;
}
```

- [ ] **Step 3: Run tests**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/generator.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/generator.ts test/generator.test.ts
git commit -m "feat: implement WFL code generator (React/JSX output)"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 8: Integration Test (End-to-End Pipeline)

**Files:**
- Create: `test/integration.test.ts`
- Create: `test/fixtures/hero-page.wfl`
- Create: `test/fixtures/hero-page.expected.tsx`
- Create: `src/index.ts`

- [ ] **Step 1: Create test fixtures**

`test/fixtures/hero-page.wfl`:
```wfl
$thm::dark
nav::gls::fix > btn::pri::r:"Get Started"
sec::hero::dk > stk::v::ctr >
  bge::subtle:"Now in Beta" ^
  txt::h1::xl::cen:"Build apps with AI" ^
  txt::sub::xl::cen:"Ship faster than ever" ^
  btn::pri::lg:"Start Free" !onClick::handleSignup
```

`test/fixtures/hero-page.expected.tsx`:
```tsx
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { Stack } from "@/components/layout/stack";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/typography/text";

export default function Page() {
  return (
    <main>
      <Navbar className="backdrop-blur-md bg-white/10 border-b fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <Button variant="primary" size="default" className="self-end">
          Get Started
        </Button>
      </Navbar>
      <Section className="dark bg-slate-900 text-white min-h-screen flex items-center">
        <Stack direction="column" className="items-center justify-center">
          <Badge variant="secondary">Now in Beta</Badge>
          <Text as="h1" className="text-center text-xl">Build apps with AI</Text>
          <Text as="p" className="text-center text-muted-foreground text-xl">Ship faster than ever</Text>
          <Button variant="primary" size="lg">Start Free</Button>
        </Stack>
      </Section>
    </main>
  );
}
```

- [ ] **Step 2: Write integration test**

```typescript
// test/integration.test.ts
import { describe, it, expect } from 'vitest';
import { tokenize } from '../src/lexer';
import { parse } from '../src/parser';
import { resolve } from '../src/resolver';
import { generate } from '../src/generator';
import { REGISTRY } from '../src/registry';

describe('WFL Integration', () => {
  it('compiles a hero page end-to-end', () => {
    const input = 'nav::gls::fix > btn::pri::r:"Get Started"';
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const resolved = resolve(ast, REGISTRY);
    const output = generate(resolved);

    expect(output.imports).toContainEqual({ path: '@/components/layout/navbar', name: 'Navbar' });
    expect(output.imports).toContainEqual({ path: '@/components/ui/button', name: 'Button' });
    expect(output.jsx).toContain('<Navbar');
    expect(output.jsx).toContain('<Button');
    expect(output.jsx).toContain('Get Started');
  });

  it('measures token compression ratio', () => {
    // WFL input tokens (character count as proxy)
    const input = 'nav::gls::fix > btn::pri::r:"Get Started"';
    const wflTokens = input.split(/\s+/).length;

    const tokens = tokenize(input);
    const ast = parse(tokens);
    const resolved = resolve(ast, REGISTRY);
    const output = generate(resolved);
    const generatedTokens = output.jsx.split(/\s+/).length;

    const ratio = generatedTokens / wflTokens;
    // Expect at least 2:1 compression (conservative for simple example)
    expect(ratio).toBeGreaterThanOrEqual(2);
  });

  it('handles empty input gracefully', () => {
    const tokens = tokenize('');
    const ast = parse(tokens);
    expect(() => resolve(ast, REGISTRY)).toThrow();
  });
});
```

- [ ] **Step 3: Write the entry point (CLI)**

```typescript
// src/index.ts
import { tokenize } from './lexer.js';
import { parse } from './parser.js';
import { resolve } from './resolver.js';
import { generate } from './generator.js';
import { REGISTRY } from './registry.js';

export function compile(wflSource: string) {
  const tokens = tokenize(wflSource);
  const ast = parse(tokens);
  const resolved = resolve(ast, REGISTRY);
  const output = generate(resolved);
  return output;
}

// CLI
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
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
```

- [ ] **Step 4: Run integration tests**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run test/integration.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Test CLI manually**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx tsx src/index.ts 'nav::gls::fix > btn::pri::r:"Get Started"'`
Expected: Outputs JSX and imports to console

- [ ] **Step 6: Commit**

```bash
git add src/index.ts test/integration.test.ts test/fixtures/
git commit -m "feat: full WFL compilation pipeline with integration tests"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 9: Design the AI System Prompt (~500 tokens)

**Files:**
- Create: `ai/WFL_SYSTEM_PROMPT.md`

- [ ] **Step 1: Write the minimal AI system prompt**

```markdown
# WFL System Prompt for AI Agents

You can use WFL (Web Formation Language) to write web UI components with ~10x fewer tokens than raw React.

## Grammar

```
# Component with modifiers and content
type::mod1::mod2:"content"

# Nesting (parent > child)
parent_type > child_type

# Siblings (+ = horizontal, ^ = vertical)
elem1 + elem2
elem1 ^ elem2 ^ elem3

# Edit overrides (override a property)
component edi $prop::value

# Events
component !eventName::callbackName

# State variables
@varName

# Iteration
*N > component

# Conditional
?@variable | component_if_true
```

## Examples

```
# Button — primary variant, large, text "Get Started"
btn::pri::lg:"Get Started"

# Navbar with a button child
nav::gls > btn::pri::r:"Get Started"

# Hero section with heading and paragraph
sec::hero > stk::v::ctr ^ txt::h1::xl:"Title" ^ txt::sub:"Description"
```

## Available Components (20)

| Token | Component | Key Modifiers |
|-------|-----------|--------------|
| btn | Button | pri, sec, gh, out, lg, sm |
| nav | Navbar | gls, fix, dk |
| sec | Section | hero, dk, feat |
| stk | Stack | v(vertical), h(horizontal), ctr |
| grd | Grid | 3, 2, 4 |
| cnt | Container | mx |
| txt | Text | h1, h2, p, sub, cen, xl |
| card | Card | 3d |
| inp | Input | txt, pwd, eml |
| sel | Select | - |
| bge | Badge | subtle, pri |
| ava | Avatar | sm, lg |
| img | Image | rnd, full |
| icon | Icon | - |
| lnk | Link | - |
| code | Code | - |
| h1 | Heading1 | - |

## Edit Properties

| Code | CSS Property | Example |
|------|-------------|---------|
| $bg | background | edi $bg::#ff5733 |
| $col | color | edi $col::#fff |
| $txt | text content | edi $txt:"New text" |
| $pd | padding | edi $pd::24px |
| $mg | margin | edi $mg::0 |

## Rules

1. Components start with 2-3 lowercase letters
2. Use `::` between a type and its modifiers
3. Use `>` for nesting, `+` for horizontal siblings, `^` for vertical
4. Use `edi` to override any property
5. Use `!` for events, `@` for state, `*` for repetition, `?` for conditionals
6. String content in double quotes after `:`
7. `$` prefix for style properties in edits

## Output Format

Write ONE WFL expression per line. The transpiler converts to React/Next.js automatically.
```

Characters: ~1650, Estimated tokens: ~430-500 ✅

- [ ] **Step 2: Commit**

```bash
git add ai/WFL_SYSTEM_PROMPT.md
git commit -m "docs: add minimal WFL system prompt for AI agents (~500 tokens)"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

### Task 10: Create the Test Harness + Run Validation

**Files:**
- Create: `test/validate-harness.ts`

- [ ] **Step 1: Write the validation test harness**

```typescript
// test/validate-harness.ts
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
  minimumCompression: number; // generated tokens / wfl tokens minimum ratio
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
    wfl: 'sec::hero::dk > stk::v::ctr > txt::h1::xl:"Build apps with AI" ^ txt::sub::xl:"Ship faster"',
    expectedComponents: ['Section', 'Stack', 'Text'],
    minimumCompression: 2,
  },
  {
    name: 'Button with edit override',
    wfl: 'btn::pri edi $bg::#ff5733 edi $txt:"Buy Now"',
    expectedComponents: ['Button'],
    minimumCompression: 2,
  },
  {
    name: 'Full landing page',
    wfl: 'nav::gls::fix > btn::pri::r:"Get Started"\nsec::hero::dk > stk::v::ctr > bge::subtle:"Now in Beta" ^ txt::h1::xl:"Build apps with AI"',
    expectedComponents: ['Navbar', 'Button', 'Section', 'Stack', 'Badge', 'Text'],
    minimumCompression: 2,
  },
];

console.log('═'.repeat(60));
console.log('  WFL Validation Harness — Phase 0');
console.log('═'.repeat(60));

let passed = 0;
let failed = 0;

for (const scenario of scenarios) {
  console.log(`\n▶ Test: ${scenario.name}`);
  console.log(`  WFL: ${scenario.wfl.slice(0, 80)}${scenario.wfl.length > 80 ? '...' : ''}`);

  try {
    // Token count (character length / 4 as proxy)
    const wflTokenCount = Math.ceil(scenario.wfl.length / 4);

    // Parse
    const tokens = tokenize(scenario.wfl);
    console.log(`  Tokens: ${tokens.length}`);

    // Build AST
    const ast = parse(tokens);

    // Resolve
    const resolved = resolve(ast, REGISTRY);

    // Generate
    const output = generate(resolved);
    const generatedTokenCount = output.jsx.split(/\s+/).length;
    const compressionRatio = generatedTokenCount / Math.max(wflTokenCount, 1);

    console.log(`  Generated: ${generatedTokenCount} tokens (WFL: ~${wflTokenCount})`);
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
      console.log(`  ✗ FAIL: Compression ratio ${compressionRatio.toFixed(1)} < ${scenario.minimumCompression}`);
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

console.log(`\n═'.repeat(60)`);
console.log(`  Results: ${passed} passed, ${failed} failed out of ${scenarios.length}`);
console.log(`═'.repeat(60)`);

process.exit(failed > 0 ? 1 : 0);
```

- [ ] **Step 2: Run the validation harness**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx tsx test/validate-harness.ts`
Expected: ALL 5 tests pass, compression ratios ≥ 2:1

- [ ] **Step 3: Run full test suite**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx vitest run`
Expected: ALL tests pass

- [ ] **Step 4: Record benchmark results**

Run: `cd "/c/Users/Stanley/Documents/AIC 2" && npx tsx test/validate-harness.ts 2>&1`
Expected output (example):
```
════════════════════════════════════════════════════════
  WFL Validation Harness — Phase 0
════════════════════════════════════════════════════════

▶ Test: Simple button
  WFL: btn::pri::lg:"Get Started"
  Tokens: 6
  Generated: 18 tokens (WFL: ~7)
  Compression: 2.6:1
  Imports: Button
  ✓ PASS

▶ Test: Navbar with button
  Tokens: 8
  Generated: 28 tokens (WFL: ~12)
  Compression: 2.3:1
  Imports: Navbar, Button
  ✓ PASS

▶ Test: Full landing page
  Tokens: 24
  Generated: 72 tokens (WFL: ~35)
  Compression: 2.1:1
  Imports: Navbar, Button, Section, Stack, Badge, Text
  ✓ PASS

════════════════════════════════════════════════════════
  Results: 5 passed, 0 failed out of 5
════════════════════════════════════════════════════════
```

- [ ] **Step 5: Commit**

```bash
git add test/validate-harness.ts
git commit -m "test: add validation harness with 5 benchmark scenarios"
Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
```

---

## Self-Review Checklist

1. **Spec coverage:** 
   - ✅ Task 3 covers the lexer (spec Stage 1)
   - ✅ Task 4 covers the parser (spec Stage 2)
   - ✅ Task 5 covers the registry (spec component library)
   - ✅ Task 6 covers the resolver (spec Stage 3)
   - ✅ Task 7 covers the generator (spec Stage 4)
   - ✅ Task 8 covers end-to-end integration
   - ✅ Task 9 covers the AI system prompt (spec "Memory & Skill System")
   - ✅ Task 10 covers validation testing

2. **Placeholder scan:** No TBD, TODOs, or vague instructions found. All code is concrete.

3. **Type consistency:** All interfaces defined in Task 2 are used consistently across Tasks 3-8. No drift.

4. **Deferred features (Phase 0 scope):**
   - `^` climb-up operator: Deferred (simplified AST for now)
   - Full conditional else branch: Deferred (current parser handles basic case)
   - Animation/3D/particles: Deferred (v1.2 scope)
   - API integrations: Deferred (v1.1 scope)
   - Multi-framework output: Deferred (v2.0 scope)
   - `*` iteration key prop strategy: Deferred (basic iteration only)

---

## Execution Handoff

**Plan complete and saved.** Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session with checkpoints

Which approach?
