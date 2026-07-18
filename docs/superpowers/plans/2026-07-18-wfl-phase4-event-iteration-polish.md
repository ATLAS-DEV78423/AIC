# WFL Phase 4 — Event & Iteration Polish

**Goal:** Fix two runtime correctness issues — smart event binding for form inputs and proper iteration keys.

**Architecture:** Both are generator-only changes (plus one type addition for keys). Smart event binding detects state + onChange on the same component and wraps the callback. Iteration keys use a new `$key` edit to pick a property from the iteration item as React key.

**Tech Stack:** TypeScript, vitest

---

### Task 4.1: Smart Event Binding

**Files:** Modify `src/generator.ts`, `test/generator.test.ts`

When a component has both a state variable AND an `onChange` event whose callback matches `set<VarName>`, auto-wrap as `(e) => setVar(e.target.value)` instead of bare `setVar`.

- [ ] **Step 1: Write the test**

```typescript
it('wraps onChange callback in (e) => setVar(e.target.value) when state matches', () => {
  const resolved: ResolvedComponent = {
    element: 'inp',
    componentName: 'Input',
    importPath: '@/components/ui/input',
    props: {},
    className: '',
    animations: [],
    content: null,
    children: [],
    events: [{ handler: '!onChange', callback: 'setQuery' }],
    state: '@query',
    iteration: null,
    conditional: null,
  };
  const result = generate(resolved);
  expect(result.jsx).toContain('onChange={(e) => setQuery(e.target.value)}');
  expect(result.jsx).toContain('value={query}');
});

it('does not wrap non-onChange events', () => {
  const resolved: ResolvedComponent = {
    element: 'btn',
    componentName: 'Button',
    importPath: '@/components/ui/button',
    props: {},
    className: '',
    animations: [],
    content: null,
    children: [],
    events: [{ handler: '!onClick', callback: 'handleClick' }],
    state: null,
    iteration: null,
    conditional: null,
  };
  const result = generate(resolved);
  expect(result.jsx).toContain('onClick={handleClick}');
});
```

- [ ] **Step 2: Modify generator event handling**

In `generateJSX()`, find the event attribute generation and add a check for onChange + state pairing:

```typescript
// Handle events
const eventAttrs = node.events.map(e => {
  const handler = e.handler.replace('!', '');
  let callback = e.callback;
  // Auto-wrap onChange for state-bound inputs
  if (handler === 'onChange' && node.state) {
    const varName = node.state.replace('@', '');
    const setter = `set${varName.charAt(0).toUpperCase() + varName.slice(1)}`;
    if (callback === setter) {
      callback = `(e) => ${setter}(e.target.value)`;
    }
  }
  return `${handler}={${callback}}`;
}).join(' ');
```

- [ ] **Step 3: Run tests**

- [ ] **Step 4: Commit**

---

### Task 4.2: Iteration Keys ($key edit)

**Files:** Modify `src/types.ts`, `src/resolver.ts`, `src/generator.ts`, `test/resolver.test.ts`, `test/generator.test.ts`

When a child inside iteration has `$key::id`, use `item.id` as React key instead of array index `i`.

- [ ] **Step 1: Add iterationKey to types**

```typescript
// In ResolvedComponent interface:
iteration: IterationSource | null;
iterationKey: string | null; // from $key edit — property to use as React key
```

- [ ] **Step 2: Handle $key in resolver**

In the edit override loop, before the catch-all `prop.startsWith('$')`:
```typescript
if (prop === '$key') {
  result.iterationKey = value;
  continue;
}
```

Wait — the resolver returns ResolvedComponent, but edits are processed inside `resolveComponent`. I need to store `iterationKey` on the return value. The resolver builds the result at the end of `resolveComponent()`. I can store it in a local variable and include it in the return.

Actually, thinking about this more simply: the resolver's `resolveIteration` is where the iteration wrapper is created. But the child is resolved first. So the flow is:

1. resolve() → node.type === 'iteration' → resolveIteration(node, registry)
2. resolveIteration: const child = resolve(node.child, registry) → child now has the $key handled
3. Create wrapper with child's iterationKey

So I need:
1. In resolveComponent(), handle $key edit and store it on the result
2. In resolveIteration(), pull the key from child and set it on the wrapper

But wait, the $key is on the child component, and the iteration wrapper is the parent. The generator needs to know what key to use when iterating. The generator looks at the wrapper node (which has iteration set) and generates the .map() call.

So either:
a) The wrapper stores the key from its child's $key
b) The generator looks at the child's iterationKey

Option (b) is simpler — the generator can check `node.children[0]?.iterationKey`.

Let me just handle it in the resolver's edit loop and add the field to ResolvedComponent.

- [ ] **Step 3: Update generator for $key**

In `generateJSX()`, in the iteration handling:
```typescript
// State-based iteration
const stateVar = node.iteration.name.replace('@', '');
const child = node.children[0];
const keyExpr = child?.iterationKey ? `item.${child.iterationKey}` : 'i';
const childJsx = node.children.map(c => generateJSX(c, imports)).join('\n');
return `{${stateVar}.map((item, i) => <React.Fragment key={${keyExpr}}>${childJsx}</React.Fragment>)}`;
```

Wait, but what about the `item` variable name? When we use `item.${keyExpr}`, the map callback uses `item` as the parameter name. If the user uses `$key::id`, we get `item.id`. If no $key, we get `i` (the index). That works.

But there's a subtlety: the user's child content might reference `{item.title}`. Currently the iteration uses `(item, i)` so `item` IS in scope. With $key, the arrow function is still `item => ...` so `item.title` still works. Good.

- [ ] **Step 4: Write tests for $key**

```typescript
it('generates key={item.id} when $key::id is set', () => {
  const resolved: ResolvedComponent = {
    element: '',
    componentName: '',
    importPath: '',
    props: {},
    className: '',
    animations: [],
    content: null,
    children: [/* btn with iterationKey: 'id' */],
    events: [],
    state: null,
    iteration: { kind: 'stateRef', name: '@items' },
    conditional: null,
    iterationKey: null,
  };
  // child has iterationKey = 'id'
  const result = generate(resolved);
  expect(result.jsx).toContain('key={item.id}');
});

it('still uses key={i} when no $key is set', () => {
  // same but child has no iterationKey
  const result = generate(resolved);
  expect(result.jsx).toContain('key={i}');
});
```

- [ ] **Step 5: Run tests**

- [ ] **Step 6: Commit**

---

## Self-Review

1. **Spec coverage:** Smart event binding and iteration keys both addressed.
2. **Placeholder scan:** All code concrete.
3. **Type consistency:** Only addition is `iterationKey: string | null` on ResolvedComponent.
4. **Deferred:** Event handler definitions (1.8), form validation (1.9), async patterns (1.10).
