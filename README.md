# WFL — Web Formation Language

> Token-efficient AI-native DSL that compiles to React/Next.js JSX.

```
nav::gls::fix > btn::pri::r:"Get Started"
```

Compiles to:

```tsx
<Navbar className="glass fixed">
  <Button variant="primary" size="rounded">Get Started</Button>
</Navbar>
```

Compression ratio: **3–5×** fewer tokens than equivalent JSX. Designed for AI generation — less prompt context for boilerplate, more for logic.

---

## Quick Start

```bash
# Run inline
npx tsx src/index.ts 'nav::gls > btn::pri:"Click"'

# Compile a file
npx tsx src/index.ts compile page.wfl --out page.tsx

# Build a directory
npx tsx src/index.ts build src/pages/ --out dist/

# Use a custom registry
npx tsx src/index.ts --registry my-comps.json compile page.wfl
```

---

## Syntax Reference

### Component

```
<element>::<mod1>::<mod2>:"<content>"
```

| Part | Example | Description |
|------|---------|-------------|
| `element` | `btn`, `nav`, `txt` | 2+ letter lowercase component code |
| `::<mod>` | `::pri`, `::lg` | Variant/modifier chain |
| `:"content"` | `:"Click me"` | Text content |

### Children / Nesting

```
parent > child
```

Siblings within a parent:

```
stk::v > txt:"A" ^ txt:"B"   # ^ = vertical sibling
stk::h > btn:"1" + btn:"2"   # + = horizontal sibling
```

### Iteration

Literal count:

```
*3 > card
```

State-driven:

```
*@items > card
*@items > card $key::id   # use item.id as React key
```

Nested:

```
*@categories > *@items > card
```

Outputs:

```tsx
{categories.map((item, i) => <>
  {item.items.map((item, j) => <>
    <Card />
  </>)}
</>)}
```

### Conditionals

Truthy check:

```
?@isAdmin | btn::del:"Delete" | txt:"No access"
```

Expression (supported operators: `>`, `<`, `>=`, `<=`, `==`, `!=`):

```
?@count > 0 | spn | txt:"Empty"
?@role == 'admin' | btn::pri:"Panel" | txt:"Guest"
```

Without false branch (renders `&&`):

```
?@loading | spn
```

### State

```
@<varName>
```

On an input — auto-binds `value` and generates `useState`:

```
inp::txt @query
```

Generates:

```tsx
const [query, setQuery] = useState('');
// ...
<input value={query} onChange={(e) => setQuery(e.target.value)} />
```

### Events

```
!<handler>::<callback>
```

Smart binding — `onChange` with matching state setter auto-wraps `(e) => setter(e.target.value)`:

```
inp @query !onChange::setQuery
```

### Edit Overrides

```
edi $<prop>::<value>
```

| Prop | CSS / Behavior | Example |
|------|---------------|---------|
| `$bg` | `background` | `edi $bg::#ff5733` |
| `$col` | `color` | `edi $col::#333` |
| `$pd` | `padding` | `edi $pd::12px` |
| `$mg` | `margin` | `edi $mg::8px` |
| `$w` | `width` | `edi $w::100%` |
| `$h` | `height` | `edi $h::200px` |
| `$fs` | `font-size` | `edi $fs::1.5rem` |
| `$fw` | `font-weight` | `edi $fw::bold` |
| `$br` | `border-radius` | `edi $br::8px` |
| `$gap` | `gap` | `edi $gap::16px` |
| `$txt` | Text content override | `edi $txt::"New text"` |
| `$src` | `src` prop | `edi $src::/image.png` |
| `$alt` | `alt` prop | `edi $alt::"Description"` |
| `$key` | React key in iteration | `*@items > card $key::id` |

### Slots (Named Children)

```
card > [header]txt::h1:"Title" [body]txt:"Content" [footer]btn:"OK"
```

Each `[slotName]` child becomes a JSX prop — rendered as `header={<Text>…</Text>}` on the parent.

### Animations

```
btn::pri ~fade300 ~bounce
```

| Animation | Default |
|-----------|---------|
| `~fade` | 300ms |
| `~fade<N>` | N ms |
| `~slide` | 300ms |
| `~bounce` | 500ms |

### Parenthesized Groups

```
nav > (btn::pri + btn::sec)
```

Groups multiple children under one parent without a wrapper component.

### Comments

```
# this is a comment
nav::gls > btn::pri:"Click"  # inline comment
```

Lines starting with `# ` are skipped.

### Multi-line Pages

```
nav::gls::fix > btn::pri:"Get Started"
sec::hero::dk > txt::h1::xl:"Welcome"
```

Each line is a top-level expression. Multi-line output wraps in `<main>`.

---

## Built-in Components

| Code | Component | Import |
|------|-----------|--------|
| `btn` | `Button` | `@/components/ui/button` |
| `txt` | `Text` | `@/components/typography/text` |
| `nav` | `Navbar` | `@/components/layout/navbar` |
| `sec` | `Section` | `@/components/layout/section` |
| `stk` | `Stack` | `@/components/layout/stack` |
| `spn` | `Spinner` | `@/components/ui/spinner` |
| `img` | `Image` | `@/components/ui/image` |
| `inp` | `Input` | `@/components/form/input` |
| `txa` | `Textarea` | `@/components/form/textarea` |
| `chk` | `Checkbox` | `@/components/form/checkbox` |
| `sel` | `Select` | `@/components/form/select` |
| `frm` | `Form` | `@/components/form/form` |
| `ico` | `Icon` | `@/components/ui/icon` |
| `ava` | `Avatar` | `@/components/ui/avatar` |
| `bad` | `Badge` | `@/components/ui/badge` |
| `card` | `Card` | `@/components/ui/card` |
| `div` | `Divider` | `@/components/ui/divider` |
| `list` | `List` | `@/components/ui/list` |
| `tabs` | `Tabs` | `@/components/ui/tabs` |
| `hero` | `Hero` | `@/components/layout/hero` |
| `cta` | `CTA` | `@/components/layout/cta` |
| `feature` | `FeatureSection` | `@/components/layout/feature-section` |
| `footer` | `Footer` | `@/components/layout/footer` |

---

## Custom Components

Define your own component registry and pass it via `compile(source, registry)` or the `--registry` CLI flag:

```json
{
  "greet": {
    "component": "Greeting",
    "importPath": "@/components/custom/greeting",
    "defaultProps": { "message": "Hello" },
    "variantProps": {},
    "modifiers": {}
  }
}
```

```bash
wfl --registry my-comps.json 'greet:"Hi"'
```

Custom registries merge with the built-in registry (your entries override built-in ones).

---

## CLI Reference

```
wfl                                # show usage
wfl "nav > btn::pri"               # inline expression → raw output
wfl compile page.wfl               # compile file → stdout
wfl compile page.wfl --out out.tsx # compile file → file
wfl build src/ --out dist/         # compile directory
wfl --registry reg.json compile... # use custom component registry
```

---

## API Reference

```typescript
import { compile, formatComponentOutput } from 'wfl';

// Compile WFL to structured output
const output = compile('nav::gls > btn::pri:"Click"');
console.log(output.imports); // [{path, name}, ...]
console.log(output.jsx);     // JSX string
console.log(output.css);     // Animation CSS
console.log(output.stateCode); // useState declarations

// Wrap in complete .tsx component file
const file = formatComponentOutput(output, 'MyPage');
// → "use client"\nimport...\nexport default function MyPage() { ... }
```

---

## Development

```bash
# Install
npm install

# Run tests (96+ tests)
npm test

# Watch mode
npm run test:watch

# Build
npm run build

# TypeScript check
npx tsc --noEmit
```

---

## Why WFL?

WFL is built for the AI-native development workflow:

| Problem | WFL Solution |
|---------|-------------|
| AI models waste context on JSX boilerplate | 3–5× token compression |
| Generated layouts need manual fixing | Declarative nesting + siblings |
| Props and styles are verbose | `::mod` chain + `edi $prop::value` |
| State/events require multiple lines | `@var` + `!onChange` on one line |
| Iteration in JSX is noisy | `*@items > card` |

---

## License

MIT
