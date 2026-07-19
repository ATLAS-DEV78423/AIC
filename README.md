# WFL — Web Formation Language

> Token-efficient AI-native DSL that compiles to React JSX / HTML+Tailwind.

```
nav::gls::fix > btn::pri::r:"Get Started"
```

Compiles to:

```tsx
<nav className="backdrop-blur-md bg-white/10 border-b fixed top-0 left-0 right-0 z-50 px-4 py-3">
  <button className="...rounded-full px-6">Get Started</button>
</nav>
```

**~3–5× fewer tokens** than equivalent JSX. Built for AI generation — less prompt space for boilerplate, more for logic.

---

## Install

```bash
npm install -g wfl
```

Or run directly without installing:

```bash
npx wfl 'nav::gls > btn::pri:"Click"'
```

**Requirements:** Node.js ≥ 18. For the default (Tailwind) output, your project needs Tailwind CSS configured. Use `--lib` for standalone React component output without Tailwind.

---

## Quick Start

```bash
# Inline expression → raw output
wfl 'nav::gls > btn::pri:"Click"'

# Compile a .wfl file
wfl compile page.wfl

# Compile file → .tsx output
wfl compile page.wfl --out page.tsx

# Compile a whole directory
wfl build src/pages/ --out dist/

# React component mode (no Tailwind)
wfl --lib 'btn::pri:"Click"'

# Use a custom component registry
wfl --registry my-comps.json compile page.wfl
```

---

## Syntax

```
element::mod1::mod2:"content"   > child + sibling
```

| Concept | Syntax | Example | Output |
|---------|--------|---------|--------|
| **Component** | `code::mod` | `btn::pri` | `<button className="bg-blue-600...">` |
| **Content** | `:"text"` | `btn::pri:"OK"` | `<button>OK</button>` |
| **Child** | `>` | `nav > btn` | `<nav><button></button></nav>` |
| **Sibling H** | `+` | `btn + btn` | `<button/><button/>` (inline) |
| **Sibling V** | `^` | `txt ^ txt` | `<p/><p/>` (stacked) |
| **Iteration** | `*N` or `*@state` | `*3 > card` | `{Array(3).fill(<Card/>)}` |
| **Conditional** | `?@var \| true \| false` | `?@admin \| panel \| txt` | `{admin ? <Panel/> : <Text/>}` |
| **State** | `@var` | `inp @query` | `const [query, setQuery] = useState('')` |
| **Event** | `!event::handler` | `!onSubmit::handle` | `onSubmit={(e) => { e.preventDefault(); handle(e) }}` |
| **Edit** | `edi $prop::val` | `edi $bg::#333` | `style={{ background: '#333' }}` |
| **Slot** | `[name]child` | `card > [hdr]txt` | `header={<Text/>}` as prop |
| **Animation** | `~name` | `btn ~fade` | CSS `@keyframes` + class |
| **Group** | `(...)` | `nav > (a + b)` | Fragment wrapper |
| **Comment** | `# text` | `# my nav` | Skipped |

See [`examples/`](examples/) for runnable `.wfl` files.

---

## Key Features

- **Tailwind-native output** — default registry maps to HTML tags + Tailwind utility classes. Zero external component deps.
- **React component mode** — `--lib` flag outputs clean React component JSX with imports.
- **Custom registries** — bring your own component library via `--registry my-comps.json`.
- **Animations** — 10 built-in CSS animations (`~fade`, `~slide`, `~bounce`, `~zoom`, `~flip`, `~lift`, `~glow`, `~pulse`, `~shake`, `~spin`).
- **Smart event binding** — `onChange` + `@state` auto-wraps `(e) => setState(e.target.value)`. `onSubmit` auto-wraps `e.preventDefault()`.
- **TypeScript** — full type definitions included.

---

## API

```typescript
import { compile, formatComponentOutput } from 'wfl';

// Compile WFL to structured output
const output = compile('nav::gls > btn::pri:"Click"');
console.log(output.jsx);      // JSX string
console.log(output.css);      // Animation CSS
console.log(output.stateCode); // useState declarations

// Wrap in a complete .tsx file
const file = formatComponentOutput(output, 'MyPage');
```

---

## AI Training

If you're training an AI model to generate WFL, see [`ai/WFL_SYSTEM_PROMPT.md`](ai/WFL_SYSTEM_PROMPT.md) — a complete system prompt template covering the full grammar, all 35 components, and examples.

---

## License

MIT
