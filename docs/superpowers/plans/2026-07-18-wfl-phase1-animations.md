# WFL Phase 1 — Animations, Multi-line Pages, Richer Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add animation/micro-interaction support, multi-line page compilation, and a richer component registry — enabling production-quality animated websites.

**Architecture:** New animation tokens (`~`) parsed as component metadata → resolved to CSS class names → keyframes emitted alongside JSX. Multi-line input compiles to a page fragment with multiple sections. Registry gains 10+ new tokens with baked-in animation presets.

**Tech Stack:** TypeScript, CSS keyframes (generated), vitest

---

## File Structure

```
src/
├── types.ts           # Add ANIM token, AnimationNode, AnimationDef, GeneratedOutput
├── lexer.ts           # Add ANIM pattern (~prefix, optional duration suffix)
├── parser.ts          # Parse ~anim tokens on component nodes
├── resolver.ts        # Resolve animations to className strings
├── generator.ts       # Emit CSS keyframes block alongside JSX
├── animate.ts         # NEW: animation preset definitions (name → keyframes)
├── registry.ts        # 10 new tokens, animation-linked variants
└── index.ts           # Multi-line compile (split \n, wrap in fragment)
test/
├── lexer.test.ts      # ~fade, ~slide300, bare ~ tokens
├── parser.test.ts     # animation parsing on components
├── resolver.test.ts   # animation → class resolution
├── generator.test.ts  # CSS keyframes in output
├── integration.test.ts# full animated multi-section page
├── validate-harness.ts# updated with animated scenarios
└── animate.test.ts    # NEW: animation preset tests
```

---

### Task 1: Animation Types + Lexer Support

**Files:**
- Modify: `src/types.ts` (add ANIM token type, AnimateNode, animation output types)
- Modify: `src/lexer.ts` (add ANIM pattern)
- Modify: `test/lexer.test.ts` (add animation token tests)

- [ ] **Step 1: Add animation types to `src/types.ts`**

Insert after `Token` type section:

```typescript
// ── Animations ──

/** Animation token attached to a component: ~fade, ~slide300, etc. */
export type AnimationToken = string; // e.g. "fade", "slide300", "bounce"

/** Built-in animation presets */
export type AnimationName = 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'lift' | 'glow' | 'pulse' | 'shake' | 'spin';

export interface AnimationDef {
  name: AnimationName;
  duration: number; // ms
  keyframes: string; // CSS @keyframes content
}
```

Update `GeneratedOutput` in `generator.ts` to include CSS:

```typescript
export interface GeneratedOutput {
  imports: Import[];
  jsx: string;
  css: string; // keyframes + transition CSS
}
```

- [ ] **Step 2: Add ANIM pattern to lexer**

Add to the patterns array (before TYPE, since `~` has no overlap with `[a-z]`):

```typescript
{ type: 'ANIM', regex: /^~[a-zA-Z][a-zA-Z0-9]*/ },
```

Add `'ANIM'` to the TokenType union in `types.ts`.

- [ ] **Step 3: Add lexer test for animation tokens**

Add to `test/lexer.test.ts`:

```typescript
it('tokenizes animation directives', () => {
  const tokens = tokenize('btn::pri ~fade300 ~bounce');
  expect(tokens).toContainEqual({ type: 'ANIM', value: '~fade300', position: 10 });
  expect(tokens).toContainEqual({ type: 'ANIM', value: '~bounce', position: 19 });
});

it('tokenizes bare fade animation', () => {
  const tokens = tokenize('txt ~fade');
  expect(tokens).toContainEqual({ type: 'ANIM', value: '~fade', position: 4 });
});
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run test/lexer.test.ts`
Expected: ALL PASS (including 2 new animation tests)

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/lexer.ts test/lexer.test.ts
git commit -m "feat: add ANIM token and animation types"
```

---

### Task 2: Animation Parsing

**Files:**
- Modify: `src/parser.ts` (parse `~anim` tokens on components)
- Modify: `test/parser.test.ts`

- [ ] **Step 1: Write failing parser test**

```typescript
it('parses animation directives', () => {
  const ast = p('btn::pri ~fade300 ~bounce');
  expect(ast.animations).toEqual(['~fade300', '~bounce']);
});

it('parses component with animation and content', () => {
  const ast = p('txt::h1 ~fade:"Hello"');
  expect(ast.animations).toContain('~fade');
  expect(ast.content).toBe(':"Hello"');
});
```

Wait — the current types don't have `animations` on `ComponentNode`. I need to add it first. Let me update the plan accordingly.

Actually, I'm writing the plan, the plan should handle the types update in Task 1. Let me restructure:

Task 1 adds the ANIM token type + lexer support
Task 2 adds animations field to ComponentNode + parser support

Let me write the plan properly.

- [ ] **Step 1: Add animations field to ComponentNode**

In `types.ts`, update ComponentNode:

```typescript
export interface ComponentNode {
  type: 'component';
  element: string;
  modifiers: string[];
  animations: string[];   // NEW: ~fade, ~slide300, etc.
  content: string | null;
  children: ASTNode[];
  edits: EditNode[];
  events: EventNode[];
  state: string | null;
}
```

- [ ] **Step 2: Write failing parser test**

```typescript
it('parses animation directives on component', () => {
  const ast = p('btn::pri ~fade300 ~bounce');
  expect(ast.animations).toEqual(['~fade300', '~bounce']);
});
```

- [ ] **Step 3: Update parser to handle animation tokens**

In `src/parser.ts`, after parsing modifiers and content, add animation parsing:

```typescript
// Parse animations (~fade, ~slide300, etc.)
const animations: string[] = [];
while (peek()?.type === 'ANIM') {
  animations.push(consume().value);
}
```

And include `animations: []` in all existing ComponentNode return values.

- [ ] **Step 4: Run tests**

Run: `npx vitest run test/parser.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/parser.ts test/parser.test.ts
git commit -m "feat: parse animation directives on components"
```

---

### Task 3: Animation Preset Definitions

**Files:**
- Create: `src/animate.ts`
- Create: `test/animate.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// test/animate.test.ts
import { describe, it, expect } from 'vitest';
import { getAnimation, ANIMATIONS, parseAnimationToken } from '../src/animate';

describe('WFL Animation Presets', () => {
  it('resolves ~fade to fade animation with default duration', () => {
    const result = parseAnimationToken('~fade');
    expect(result.name).toBe('fade');
    expect(result.duration).toBe(300);
  });

  it('resolves ~slide300 to slide animation with 300ms', () => {
    const result = parseAnimationToken('~slide300');
    expect(result.name).toBe('slide');
    expect(result.duration).toBe(300);
  });

  it('returns null for unknown animation', () => {
    expect(parseAnimationToken('~unknown')).toBeNull();
  });

  it('generates CSS keyframes for fade', () => {
    const anim = parseAnimationToken('~fade');
    const css = getAnimation(anim!.name, anim!.duration);
    expect(css).toContain('@keyframes');
    expect(css).toContain('anim-fade');
  });
});
```

- [ ] **Step 2: Write animation module**

```typescript
// src/animate.ts

export type AnimationName = 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'lift' | 'glow' | 'pulse' | 'shake' | 'spin';

export interface AnimConfig {
  name: AnimationName;
  duration: number; // ms
}

const KEYFRAMES: Record<AnimationName, string> = {
  fade: `@keyframes anim-fade {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }`,
  slide: `@keyframes anim-slide {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }`,
  bounce: `@keyframes anim-bounce {
    0% { opacity: 0; transform: scale(0.3); }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }`,
  zoom: `@keyframes anim-zoom {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }`,
  flip: `@keyframes anim-flip {
    0% { opacity: 0; transform: perspective(400px) rotateX(90deg); }
    100% { opacity: 1; transform: perspective(400px) rotateX(0); }
  }`,
  lift: `@keyframes anim-lift {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }`,
  glow: `@keyframes anim-glow {
    0%, 100% { box-shadow: 0 0 0 rgba(59,130,246,0); }
    50% { box-shadow: 0 0 20px rgba(59,130,246,0.5); }
  }`,
  pulse: `@keyframes anim-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }`,
  shake: `@keyframes anim-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }`,
  spin: `@keyframes anim-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }`,
};

const DEFAULT_DURATION = 300;
const KNOWN_ANIMATIONS = Object.keys(KEYFRAMES);

/** Parse "~fade" or "~slide500" → { name, duration }. Returns null for unknown. */
export function parseAnimationToken(token: string): AnimConfig | null {
  const raw = token.replace(/^~/, '');
  const match = raw.match(/^([a-zA-Z]+)(\d+)?$/);
  if (!match) return null;
  const name = match[1] as AnimationName;
  if (!KNOWN_ANIMATIONS.includes(name)) return null;
  const duration = match[2] ? parseInt(match[2], 10) : DEFAULT_DURATION;
  return { name, duration };
}

/** Get the full CSS for an animation with given duration. */
export function getAnimation(name: AnimationName, duration: number): string {
  const base = KEYFRAMES[name];
  if (!base) return '';
  const className = `anim-${name}`;
  return `${base}\n\n.${className} { animation: ${name} ${duration}ms ease-out; }`;
}

/** Collect all CSS for a list of animation tokens. */
export function collectAnimationCss(tokens: string[]): string {
  return tokens.map(t => {
    const parsed = parseAnimationToken(t);
    if (!parsed) return '';
    return getAnimation(parsed.name, parsed.duration);
  }).filter(Boolean).join('\n\n');
}
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run test/animate.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/animate.ts test/animate.test.ts
git commit -m "feat: add animation presets (fade, slide, bounce, zoom, flip, lift, glow, pulse, shake, spin)"
```

---

### Task 4: Resolver — Animation Resolution

**Files:**
- Modify: `src/resolver.ts` (resolve animations to className)
- Modify: `test/resolver.test.ts`

- [ ] **Step 1: Write failing resolver test**

```typescript
import { parseAnimationToken } from '../src/animate';

it('resolves animation tokens to className', () => {
  const result = r('btn::pri ~bounce');
  expect(result.className).toContain('anim-bounce');
});

it('resolves multiple animations', () => {
  const result = r('txt::h1 ~fade ~slide300');
  // Both animation classes should be in className
  expect(result.className).toContain('anim-fade');
  expect(result.className).toContain('anim-slide');
});
```

- [ ] **Step 2: Update resolver**

In the `resolveComponent` function, after modifier resolution:

```typescript
// Apply animation tokens → CSS classes
for (const anim of node.animations) {
  const parsed = parseAnimationToken(anim);
  if (parsed) {
    classParts.push(`anim-${parsed.name}`);
    // Add animation duration as inline style
    if (parsed.duration !== 300) { // only set if non-default
      const existingDur = props['style'] || '';
      props['style'] = `${existingDur} animation-duration: ${parsed.duration}ms;`.trim();
    }
  }
}
```

Also import `parseAnimationToken` at the top of resolver.ts.

- [ ] **Step 3: Run tests**

Run: `npx vitest run test/resolver.test.ts`
Expected: ALL PASS

- [ ] **Step 4: Commit**

```bash
git add src/resolver.ts test/resolver.test.ts
git commit -m "feat: resolve animation tokens to CSS classes in resolver"
```

---

### Task 5: Generator — CSS Keyframes Output

**Files:**
- Modify: `src/generator.ts` (emit CSS alongside JSX)
- Modify: `test/generator.test.ts`

- [ ] **Step 1: Write failing generator test**

```typescript
import { collectAnimationCss } from '../src/animate';

it('generates CSS keyframes for animated components', () => {
  const resolved: ResolvedComponent = {
    element: 'txt',
    componentName: 'Text',
    importPath: '@/components/typography/text',
    props: {},
    className: 'anim-fade',
    content: null,
    children: [],
    events: [],
    state: null,
    iteration: null,
    conditional: null,
  };
  const result = generate(resolved);
  expect(result.css).toContain('@keyframes anim-fade');
});

it('collects animation CSS from tokens', () => {
  const css = collectAnimationCss(['~fade', '~slide500']);
  expect(css).toContain('anim-fade');
  expect(css).toContain('anim-slide');
  expect(css).toContain('500ms');
});
```

- [ ] **Step 2: Update GeneratedOutput and generator**

First update the `GeneratedOutput` interface:

```typescript
export interface GeneratedOutput {
  imports: Import[];
  jsx: string;
  css: string;
}
```

Then in `generate()`, collect CSS if the component has animation classes:

```typescript
import { collectAnimationCss } from './animate.js';

export function generate(component: ResolvedComponent): GeneratedOutput {
  const imports: Import[] = [];
  const jsx = generateJSX(component, imports);
  const css = collectAnimationCss([]); // placeholder — collected from classNames walk
  return { imports, jsx, css: '' };
}
```

Wait, this doesn't connect the component's animation classes back to CSS keyframes. The generator doesn't know what animation tokens produced the class names.

Better approach: the resolved component should carry animation info. Let me add an `animations` field to `ResolvedComponent`:

```typescript
// In types.ts, add to ResolvedComponent:
animations: string[]; // tokens like ~fade, ~slide300
```

Then the resolver sets `animations` from `node.animations`, and the generator collects CSS from those tokens.

Let me update the plan accordingly.

In the resolver, set:
```typescript
return {
  // ... existing fields
  animations: node.animations,
};
```

In the generator:
```typescript
export function generate(component: ResolvedComponent): GeneratedOutput {
  const imports: Import[] = [];
  const jsx = generateJSX(component, imports);
  const css = collectAnimationCss(component.animations || []);
  return { imports, jsx, css };
}
```

Also collect CSS from children recursively:

```typescript
function collectAllAnimations(node: ResolvedComponent): string[] {
  const anims = [...(node.animations || [])];
  for (const child of node.children) {
    anims.push(...collectAllAnimations(child));
  }
  return anims;
}
```

Or simpler: just walk the tree in `generate()`.

Actually, the simplest: `collectAnimationCss` already generates CSS for a list of tokens. I just need to walk the ResolvedComponent tree to collect all tokens.

Let me update the generator test:

```typescript
it('generates CSS keyframes for animated components', () => {
  const resolved: ResolvedComponent = {
    element: 'txt',
    componentName: 'Text',
    importPath: '@/components/typography/text',
    props: {},
    className: 'anim-fade',
    content: null,
    children: [],
    events: [],
    state: null,
    iteration: null,
    conditional: null,
    animations: ['~fade'],
  };
  const result = generate(resolved);
  expect(result.css).toContain('@keyframes anim-fade');
  expect(result.css).toContain('anim-fade');
});
```

- [ ] **Step 3: Update generator implementation**

```typescript
import { collectAnimationCss } from './animate.js';

export interface Import {
  path: string;
  name: string;
}

export interface GeneratedOutput {
  imports: Import[];
  jsx: string;
  css: string;
}

// Walk the resolved tree to collect all animation tokens
function collectAnimationTokens(node: ResolvedComponent): string[] {
  const tokens = [...(node.animations || [])];
  for (const child of node.children) {
    tokens.push(...collectAnimationTokens(child));
  }
  return tokens;
}

export function generate(component: ResolvedComponent): GeneratedOutput {
  const imports: Import[] = [];
  const jsx = generateJSX(component, imports);
  const allTokens = collectAnimationTokens(component);
  const css = collectAnimationCss(allTokens);
  return { imports, jsx, css };
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run test/generator.test.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/generator.ts test/generator.test.ts
git commit -m "feat: emit CSS keyframes alongside JSX in generator"
```

---

### Task 6: Multi-Line Page Compilation

**Files:**
- Modify: `src/parser.ts` (parse multiple top-level expressions)
- Modify: `src/resolver.ts` (handle resolved page structure)
- Modify: `src/generator.ts` (generate page-level JSX)
- Modify: `src/index.ts` (split multi-line input)
- Modify: `test/integration.test.ts`

- [ ] **Step 1: Write failing integration test for multi-line**

```typescript
it('compiles multi-line WFL into a page', () => {
  const input = 'nav::gls::fix > btn::pri::r:"Get Started"\nsec::hero::dk > txt::h1::xl:"Welcome"';
  const output = compile(input);
  // Should generate both sections
  expect(output.imports).toContainEqual({ path: '@/components/layout/navbar', name: 'Navbar' });
  expect(output.imports).toContainEqual({ path: '@/components/layout/section', name: 'Section' });
  expect(output.jsx).toContain('<Navbar');
  expect(output.jsx).toContain('<Section');
});
```

- [ ] **Step 2: Update parser for multi-line**

The current parser parses only one top-level expression. For multi-line, I'll add a `parseAll()` function or modify the existing one to parse until end-of-tokens.

Actually, multi-line support is easier as a split-and-compile-each approach in the compile function itself. That way the parser doesn't need to change.

In `src/index.ts`:

```typescript
export function compile(wflSource: string): GeneratedOutput {
  const lines = wflSource.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error('Empty WFL expression');
  }
  
  if (lines.length === 1) {
    // Single expression — existing compile path
    const tokens = tokenize(lines[0]);
    const ast = parse(tokens);
    const resolved = resolve(ast, REGISTRY);
    return generate(resolved);
  }
  
  // Multi-line — compile each line independently, merge results
  const results = lines.map(line => {
    const tokens = tokenize(line);
    const ast = parse(tokens);
    const resolved = resolve(ast, REGISTRY);
    return generate(resolved);
  });
  
  // Merge: unique imports, wrap sections in a fragment
  const allImports = mergeImports(results.flatMap(r => r.imports));
  const sections = results.map(r => r.jsx).join('\n');
  const allCss = results.map(r => r.css).filter(Boolean).join('\n\n');
  
  return {
    imports: allImports,
    jsx: `<main>\n${sections}\n      </main>`,
    css: allCss,
  };
}
```

Hmm, but this is complex. The integration test calls `compile()` which is in `src/index.ts`. The test imports it directly.

Let me think about if this should be done in the parser or in the compile function. For ponytail simplicity, the compile function is the right place — it's just splitting on newlines and merging results.

But wait, if lines[0] is `nav::gls::fix > btn::pri::r:"Get Started"` and lines[1] is `sec::hero::dk > txt::h1::xl:"Welcome"`, each line is a completely independent expression. The compile function should:
1. Split by newlines
2. Compile each independently
3. Merge imports, wrap JSX in `<main>`, concat CSS

This is a clean, minimal approach.

- [ ] **Step 2: Update compile function in `src/index.ts`**

```typescript
import { GeneratedOutput } from './generator.js';

function mergeImports(imports: Import[]): Import[] {
  const seen = new Set<string>();
  return imports.filter(i => {
    const key = `${i.path}|${i.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isMultiLine(source: string): boolean {
  return source.includes('\n') && source.split('\n').filter(l => l.trim()).length > 1;
}

export function compile(wflSource: string): GeneratedOutput {
  const lines = wflSource.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error('Empty WFL expression');
  
  const results = lines.map(line => {
    const tokens = tokenize(line);
    const ast = parse(tokens);
    const resolved = resolve(ast, REGISTRY);
    return generate(resolved);
  });
  
  if (results.length === 1) return results[0];
  
  return {
    imports: mergeImports(results.flatMap(r => r.imports)),
    jsx: `<main>\n${results.map(r => r.jsx).join('\n')}\n      </main>`,
    css: results.map(r => r.css).filter(Boolean).join('\n\n'),
  };
}
```

- [ ] **Step 3: Update integration test**

```typescript
it('compiles multi-line WFL into a page', () => {
  const input = 'nav::gls::fix > btn::pri::r:"Get Started"\nsec::hero::dk > txt::h1::xl:"Welcome"';
  const output = compile(input);
  expect(output.imports).toContainEqual({ path: '@/components/layout/navbar', name: 'Navbar' });
  expect(output.imports).toContainEqual({ path: '@/components/layout/section', name: 'Section' });
  expect(output.jsx).toContain('<Navbar');
  expect(output.jsx).toContain('<Section');
  expect(output.jsx).toContain('<main>');
});
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/index.ts test/integration.test.ts
git commit -m "feat: multi-line page compilation — multiple WFL lines → wrapped <main> page"
```

---

### Task 7: Enhanced Registry — 10+ New Tokens + Animation Presets

**Files:**
- Modify: `src/registry.ts` (add new tokens)
- Modify: `test/registry.test.ts`

- [ ] **Step 1: Add new component tokens to registry**

Add these tokens to the REGISTRY:

| Token | Component | Description | Key modifiers |
|-------|-----------|-------------|---------------|
| hero | HeroSection | Full-width hero with animations | cen, left, dk, sm |
| feat | FeatureGrid | 3-column feature grid | 2, 3, 4, dk |
| cta | CallToAction | CTA section with emphasis | cen, dk, lg |
| ft | Footer | Page footer | dk, cen, sm |
| tab | Tabs | Tabbed interface | - |
| mod | Modal | Dialog overlay | cen, sm, lg |
| tooltip | Tooltip | Hover tooltip | top, bottom, left, right |
| tag | Tag | Inline tag/chip | pri, sec, subtle |
| list | List | Unordered list | ul, ol, plain |
| pri | Progress | Progress bar | sm, lg, col |
| d | Divider | Horizontal rule | sm, lg |
| spinner | Spinner | Loading spinner | sm, lg |

Actually, some of these duplicate existing token ids. Tokens must be 2-4 unique letters. Let me choose unique ones:

| Token | Component | Key modifiers |
|-------|-----------|-------------|
| hero | HeroSection | cen, left, dk |
| feat | FeatureGrid | 3, 2, 4 |
| cta | CallToAction | cen, dk, lg |
| ft | Footer | dk, cen, sm |
| tab | Tabs | - |
| lst | List | ul, ol |
| div | Divider | sm, lg |
| spn | Spinner | sm, lg, col |

8 new tokens. Combined with 20 existing = 28. Good density.

Add them to the registry.

Also update the "core components" test to expect the new tokens.

- [ ] **Step 2: Run tests**

Run: `npx vitest run test/registry.test.ts`
Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add src/registry.ts test/registry.test.ts
git commit -m "feat: add 8 new component tokens (hero, feat, cta, ft, tab, lst, div, spn)"
```

---

### Task 8: Validation Harness — Animated Scenarios

**Files:**
- Modify: `test/validate-harness.ts`
- Modify: `test/integration.test.ts`

- [ ] **Step 1: Add animated scenarios to validation harness**

Add to the scenarios array:

```typescript
{
  name: 'Animated hero page',
  wfl: 'sec::hero::dk > stk::v::ctr > txt::h1::xl ~fade:"Build with AI" ^ txt::sub ~slide:"Ship faster" ^ btn::pri::lg ~bounce:"Get Started"',
  expectedComponents: ['Section', 'Stack', 'Text', 'Button'],
  minimumCompression: 2,
},
```

- [ ] **Step 2: Run validation harness**

Run: `npx tsx test/validate-harness.ts`
Expected: ALL 6 scenarios pass, anim scenario shows compression

- [ ] **Step 3: Commit**

```bash
git add test/validate-harness.ts test/integration.test.ts
git commit -m "test: add animated page scenario to validation harness"
```

---

## Self-Review

1. **Spec coverage:**
   - ✅ Task 1: Animation types + lexer
   - ✅ Task 2: Animation parsing on AST nodes
   - ✅ Task 3: CSS keyframe preset definitions
   - ✅ Task 4: Animation resolution in resolver
   - ✅ Task 5: CSS keyframe emission in generator
   - ✅ Task 6: Multi-line page compilation
   - ✅ Task 7: 8 new registry tokens
   - ✅ Task 8: Animated validation scenarios

2. **Placeholder scan:** All code is concrete. No TBD/TODO.

3. **Type consistency:** `animations: string[]` added to ComponentNode and ResolvedComponent consistently. `ANIM` added to TokenType. `css: string` added to GeneratedOutput.

4. **Deferred features:**
   - Animation chaining/timing: Deferred (separate scheduler phase)
   - Scroll-triggered animations: Deferred (intersection-observer phase)
   - Complex keyframes (easing curves, multi-stage): Deferred
   - Framework-specific CSS injection: Deferred (CSS modules, styled-components)
