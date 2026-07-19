<div align="center">

# WFL — Web Formation Language

**Token-efficient AI-native DSL that compiles to React JSX / HTML+Tailwind**

[![npm version](https://img.shields.io/badge/npm-v0.1.0-blue)](https://www.npmjs.com/package/wfl)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange)](#contributing)

```wfl
nav::gls::fix > btn::pri::r:"Get Started"
```

↓ _compiles to_ ↓

```tsx
<nav className="backdrop-blur-md bg-white/10 border-b fixed top-0 left-0 right-0 z-50 px-4 py-3">
  <button className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6 py-2 font-medium">
    Get Started
  </button>
</nav>
```

**~3–5× fewer tokens than equivalent JSX.** Built for AI generation — less prompt context for boilerplate, more for actual logic.

</div>

---

## Why WFL?

| Problem | WFL Solution |
|---------|-------------|
| AI models waste context on JSX boilerplate | 3–5× token compression |
| Generated layouts need manual fixing | Declarative nesting + siblings in one line |
| Props and styles are verbose | `::mod` chains + `edi $prop::value` overrides |
| State + events require multiple lines | `@var` + `!onChange` on a single component |
| Iteration in JSX is noisy | `*3 > card` or `*@items > card` |
| Animations need separate CSS | `~fade ~bounce` → auto-generated `@keyframes` |

WFL isn't a replacement for React — it's a **compilation target** optimized for AI generation. Feed it to an LLM and get readable, production-quality JSX back.

---

## Install

```bash
npm install -g wfl
```

Or run directly without installing:

```bash
npx wfl 'nav::gls > btn::pri:"Click"'
```

**Requirements:** Node.js ≥ 18. For default (Tailwind) output, your project needs [Tailwind CSS](https://tailwindcss.com) configured. Use `--lib` for standalone React component output without Tailwind.

---

## Quick Start

```bash
# Inline expression → raw JSX output
wfl 'nav::gls > btn::pri:"Click"'

# Compile a .wfl file → stdout
wfl compile page.wfl

# Compile file → .tsx output file
wfl compile page.wfl --out page.tsx

# Compile an entire directory
wfl build src/pages/ --out dist/

# React component mode (no Tailwind classes)
wfl --lib 'btn::pri:"Click"'

# Custom component registry
wfl --registry my-comps.json compile page.wfl

# Version info
wfl --version
```

---

## Syntax Reference

```
element::mod1::mod2:"content" > child + sibling
```

| Concept | Syntax | Example | Generated Output |
|---------|--------|---------|-----------------|
| **Component** | `code::mod` | `btn::pri` | `<button className="bg-blue-600...">` |
| **Content** | `:"text"` | `btn::pri:"OK"` | `<button>OK</button>` |
| **Child** | `>` | `nav > btn` | `<nav><button/></nav>` |
| **Sibling (H)** | `+` | `btn + btn` | Side-by-side inline |
| **Sibling (V)** | `^` | `txt ^ txt` | Stacked vertically |
| **Iteration** | `*N` / `*@state` | `*3 > card` | `{items.map(...)}` |
| **Conditional** | `?@var \| true \| false` | `?@admin \| panel \| txt` | `{admin ? <P/> : <T/>}` |
| **State** | `@var` | `inp @query` | `useState('')` + `value={query}` |
| **Event** | `!ev::handler` | `!onSubmit::handle` | Smart binding (see below) |
| **Edit** | `edi $prop::val` | `edi $bg::#333` | Inline style / prop override |
| **Slot** | `[name]child` | `card > [hdr]txt` | Named JSX prop |
| **Animation** | `~name` | `btn ~fade` | CSS `@keyframes` + class |
| **Group** | `(...)` | `nav > (a + b)` | Fragment wrapper |
| **Comment** | `# text` | `# my section` | Line skipped |

### Component Types

All 35 built-in components map to **HTML tags + Tailwind utility classes** (default mode) or **React components** (`--lib` mode).

| Code | HTML Tag | Purpose | Key Modifiers |
|------|----------|---------|--------------|
| `btn` | `<button>` | Button | `pri`, `sec`, `gh`, `out`, `lg`, `sm`, `r` |
| `txt` | `<p>` | Text/typography | `h1`, `h2`, `p`, `sub`, `xl`, `cen` |
| `nav` | `<nav>` | Navbar | `gls` (glass), `fix` (fixed), `dk` |
| `sec` | `<section>` | Section/hero | `hero`, `feat`, `dk` |
| `stk` | `<div>` | Flex stack | `v` (vertical), `h`, `ctr` |
| `grd` | `<div>` | CSS grid | `2`, `3`, `4` (columns) |
| `cnt` | `<div>` | Container | `mx` (centered) |
| `card` | `<div>` | Card | `out`, `3d` |
| `inp` | `<input>` | Input | `txt`, `pwd`, `eml` |
| `frm` | `<form>` | Form | — |
| `h1`–`h3` | `<h1>`–`<h3>` | Headings | — |
| `img` | `<img>` | Image | `rnd`, `full` |
| `bge` | `<span>` | Badge | `subtle`, `pri` |
| `ava` | `<div>` | Avatar | `sm`, `lg` |
| `lnk` | `<a>` | Link | — |
| `lst` | `<ul>` | List | — |
| `code` | `<code>` | Code | — |
| `txa` | `<textarea>` | Textarea | — |
| `chk` | `<input>` | Checkbox | — |
| `rad` | `<input>` | Radio | — |
| `sel` | `<select>` | Select | — |
| `swt` | `<div>` | Switch/toggle | — |
| `lbl` | `<label>` | Label | — |
| `quote` | `<blockquote>` | Blockquote | — |
| `tab` | `<div>` | Tabs | — |
| `spn` | `<span>` | Spinner | — |
| `div` | `<hr>` | Divider | — |
| `icon` | `<i>` | Icon | — |
| `hero` | `<section>` | Hero layout | — |
| `feat` | `<section>` | Feature section | — |
| `cta` | `<section>` | Call to action | — |
| `ft` | `<footer>` | Footer | — |

### Children & Nesting

```wfl
# Parent > child
nav > btn::pri:"Home"

# Multiple children (horizontal siblings)
stk::h > txt:"Left" + txt:"Right"

# Stacked (vertical siblings)
stk::v > txt:"Top" ^ txt:"Bottom"

# Parenthesized group (no wrapper div)
nav > (btn::pri + btn::sec)
```

### State & Events

```wfl
# State declaration — auto-generates useState + value binding
inp::txt @query

# Smart event binding — onChange auto-wraps (e) => setState(e.target.value)
inp::txt @query !onChange::setQuery

# onSubmit auto-wraps e.preventDefault()
frm > btn::pri:"Submit" !onSubmit::handleSubmit

# Standalone state (bare @var on its own line for multi-line pages)
@query
frm > inp::txt !onChange::setQuery ^ btn::pri:"Search"
```

### Iteration

```wfl
# Literal count — generates N copies
*3 > card

# State-driven — maps over array
*@items > card

# With stable React key (recommended over index)
*@items > card $key::id

# Nested iteration
*@categories > *@items > card
```

### Conditionals

```wfl
# If/else
?@isAdmin | btn::del:"Delete" | txt:"No access"

# Expression comparison (supports: >, <, >=, <=, ==, !=)
?@count > 0 | spn | txt:"Empty"
?@role == 'admin' | btn::pri:"Panel" | txt:"Guest"

# Truthy-only (renders &&)
?@loading | spn
```

### Edit Overrides

Override CSS or element props inline with `edi $prop::value`:

| Prop | Maps To | Example |
|------|---------|--------|
| `$bg` | `style.background` | `edi $bg::#ff5733` |
| `$col` | `style.color` | `edi $col::white` |
| `$pd` | `style.padding` | `edi $pd::24px` |
| `$mg` | `style.margin` | `edi $mg::0` |
| `$w` | `style.width` | `edi $w::100%` |
| `$h` | `style.height` | `edi $h::200px` |
| `$fs` | `style.font-size` | `edi $fs::1.5rem` |
| `$fw` | `style.font-weight` | `edi $fw::bold` |
| `$br` | `style.border-radius` | `edi $br::8px` |
| `$gap` | `style.gap` | `edi $gap::16px` |
| `$txt` | Text content override | `edi $txt::"New text"` |
| `$src` | `src` attribute | `edi $src::/image.png` |
| `$alt` | `alt` attribute | `edi $alt::"Description"` |
| `$key` | React key in iteration | `$key::id` |

Booleans and numbers auto-coerce for correct React rendering (`$required::true` → `required={true}`, not `required="true"`). HTML attributes auto-convert to camelCase (`minlength` → `minLength`).

### Slots (Named Children)

```wfl
card > [header]txt::h1:"Title" [body]txt:"Content" [footer]btn:"OK"
```

Each `[slotName]` child renders as a named JSX prop on the parent component.

### Animations

```wfl
btn::pri ~fade ~bounce
```

10 built-in CSS animations, auto-generating `@keyframes`:

| Token | Effect | Default |
|-------|--------|---------|
| `~fade` | Fade in | 300ms |
| `~slide` | Slide up | 300ms |
| `~bounce` | Bounce in | 500ms |
| `~zoom` | Scale in | 300ms |
| `~flip` | 3D flip | 400ms |
| `~lift` | Float up | 300ms |
| `~glow` | Glow pulse | 2000ms |
| `~pulse` | Opacity pulse | 2000ms |
| `~shake` | Shake | 400ms |
| `~spin` | Spin | 1000ms |

Custom duration: `~slide500` = slide over 500ms.

---

## API

```typescript
import { compile, formatComponentOutput } from 'wfl';

// Compile WFL to structured output
const output = compile('nav::gls > btn::pri:"Click"');
// {
//   imports: [{ path: 'react', name: 'useState' }],
//   jsx: '<nav ...><button ...>Click</button></nav>',
//   css: '',
//   stateCode: ''
// }

// Wrap in a complete .tsx file
const file = formatComponentOutput(output, 'MyPage');
// → "use client"\nimport...\nexport default function MyPage() { ... }
```

---

## Examples

See [`examples/`](examples/) for 6 runnable `.wfl` files:

| File | Shows |
|------|-------|
| [`button.wfl`](examples/button.wfl) | 4 button variants (primary, secondary, ghost, outline) |
| [`navbar.wfl`](examples/navbar.wfl) | Glass/fixed navbar with links and CTA |
| [`form.wfl`](examples/form.wfl) | Form with `@state`, events, auto-binding |
| [`card-grid.wfl`](examples/card-grid.wfl) | 3-column grid with `*3 > card` iteration |
| [`conditional.wfl`](examples/conditional.wfl) | Ternary conditional rendering |
| [`animated-hero.wfl`](examples/animated-hero.wfl) | Hero with slide/fade/bounce animations |

---

## AI Training

For LLMs generating WFL, see the **[complete system prompt](ai/WFL_SYSTEM_PROMPT.md)** covering the full grammar, all 35 components, events/state/conditionals, slots, animations, and output format. Drop it into any AI's system prompt for high-quality WFL generation.

---

## Custom Registries

Bring your own component library:

```json
{
  "mybtn": {
    "component": "MyButton",
    "importPath": "@/components/ui/my-button",
    "defaultProps": {},
    "modifiers": {
      "big": { "prop": "size", "value": "large" }
    }
  }
}
```

```bash
wfl --registry my-comps.json 'mybtn::big:"Click"'
```

---

## Mode: Default vs `--lib`

| Mode | Output | Best for |
|------|--------|----------|
| **Default** | HTML tags + Tailwind utility classes | Projects using Tailwind CSS |
| **`--lib`** | React component imports (`Button` from `@/components/ui/button`) | Projects with shadcn/ui or custom component libraries |

---

## License

MIT — see [LICENSE](LICENSE).

---

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
