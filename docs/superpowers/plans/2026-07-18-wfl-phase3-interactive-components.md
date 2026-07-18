# WFL Phase 3 — Interactive Components

**Goal:** Make state variables actually usable in UIs through auto-binding and default content — two small, high-impact features.

**Architecture:** Auto state binding is a generator-only change: when a `ResolvedComponent` has `state`, emit `value={varName}` as a prop. Default content is a resolver + registry change: entries with `defaultContent` fill in when no explicit `:""` content is present in the WFL source.

**Tech Stack:** TypeScript, vitest

---

## File Structure

```
src/
├── resolver.ts    # Use entry.defaultContent when node.content is null
├── generator.ts   # Auto-bind value={var} when component has state
├── registry.ts    # Add defaultContent to some entries (inp, btn, txt)
```

---

### Task 1: Auto State-Value Binding

**Files:** Modify `src/generator.ts`, `test/generator.test.ts`

When a resolved component has `state: '@query'`, the generator should emit `value={query}` as a prop automatically.

- [ ] **Step 1: Write failing test**

In `test/generator.test.ts`, add a test where a component with `state: '@query'` gets `value={query}` in its JSX output:

```typescript
it('auto-binds state variable to value prop', () => {
  const resolved: ResolvedComponent = {
    element: 'inp',
    componentName: 'Input',
    importPath: '@/components/ui/input',
    props: {},
    className: '',
    animations: [],
    content: null,
    children: [],
    events: [],
    state: '@query',
    iteration: null,
    conditional: null,
  };
  const result = generate(resolved);
  expect(result.jsx).toContain('value={query}');
});
```

- [ ] **Step 2: Add auto-binding in generator**

In `generateJSX()`, after building `propParts` from `node.props`, add:

```typescript
if (node.state) {
  const varName = node.state.replace('@', '');
  propParts.push(`value={${varName}}`);
}
```

- [ ] **Step 3: Run test**

Run: `npx vitest run test/generator.test.ts`
Expected: ALL PASS

---

### Task 2: Default Content for Registry Entries

**Files:** Modify `src/resolver.ts`, `src/registry.ts`, `test/resolver.test.ts`, `test/registry.test.ts`

The `RegistryEntry` type already has `defaultContent?: string`. Add values to some entries and use them in the resolver.

- [ ] **Step 1: Add defaultContent values to registry**

Add `defaultContent` to:
- `btn` → `"Button"`
- `txt` → `"Text"`
- `inp` → `""` (already falsy, but explicit)
- `card` → `"Card"`

- [ ] **Step 2: Update resolver to use defaultContent**

In `resolveComponent()`, replace `let content = node.content;` with:

```typescript
let content = node.content ?? entry.defaultContent ?? null;
```

This means: use explicit content from the WFL source first, fall back to the registry's default, then null.

- [ ] **Step 3: Write failing test**

```typescript
it('uses defaultContent from registry when no explicit content', () => {
  const result = r('btn::pri');
  expect(result.content).toBe(':"Button"'); // wrapped in :"..." format
});
```

Wait — the resolver stores content as-is from the parser (e.g., `:"Button"` from WFL `btn::pri:"Button"`). But `defaultContent` is just `"Button"` without the formatting. I need to handle this consistently.

Actually, let me check: in the resolver, `node.content` is the raw value from the parser. For explicit content like `btn::pri:"Click"`, `node.content` would be `:"Click"`. The defaultContent should be stored in the same format or stored raw and formatted at use.

Let me store `defaultContent` as the plain string without `:""` wrapper, and format it in the resolver:

```typescript
let content = node.content;
if (!content && entry.defaultContent) {
  content = `:"${entry.defaultContent}"`;
}
```

This is cleaner.

- [ ] **Step 4: Run tests**

Run: `npx vitest run`
Expected: ALL PASS

---

### Task 3: Update STATE.md

Mark Phase 3 tasks in STATE.md.

---

## Self-Review

1. **Spec coverage:** Both features addressed — auto state binding and default content.
2. **Placeholder scan:** All code is concrete.
3. **Type consistency:** Uses existing `state` and `defaultContent` fields.
4. **Deferred:**
   - Complex interpolation (`{item.prop}` in iteration context)
   - Event handler bodies
   - Iteration keys ($key edit)
   - Responsive modifiers
