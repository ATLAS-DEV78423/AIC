# WFL — Complete AI System Prompt

Use this prompt when you want an AI model to generate correct WFL (Web Formation Language). Copy-paste the relevant sections into your AI's system prompt or include them in your context window.

---

## One-Line Description

WFL (Web Formation Language) is a compact AI-native DSL that compiles to React JSX with Tailwind CSS (default) or standalone React components (with `--lib`). It uses ~3–5× fewer tokens than equivalent JSX.

---

## Grammar (Full)

### Component Line Structure

```
element::mod1::mod2:"content" > child + sibling ^ sibling edi $prop::val @state !event::handler ~anim # comment
```

| Part | Required | Example | Description |
|------|----------|---------|-------------|
| `element` | ✅ | `btn` | Component type (2+ lowercase chars, may include digits like h1/h2/h3) |
| `::mod` | ❌ | `::pri` | Chained modifiers (zero or more, each prefixed with `::`) |
| `:"content"` | ❌ | `:"Click me"` | Text content in double quotes after `:` |
| `> child` | ❌ | `> btn` | Child component (nesting) |
| `+ child` | ❌ | `+ btn` | Horizontal sibling |
| `^ child` | ❌ | `^ txt` | Vertical sibling |
| `edi $p::v` | ❌ | `edi $bg::#333` | Edit override (inline style/prop change) |
| `@state` | ❌ | `@query` | State variable declaration |
| `!ev::cb` | ❌ | `!onClick::handleClick` | Event handler binding |
| `~anim` | ❌ | `~fade` | Animation preset |
| `# text` | ❌ | `# my button` | Comment (line is skipped) |

### Component Types

34 built-in types. Default output = HTML tag + Tailwind CSS classes. With `--lib` flag = React component imports.

| Code | Default Tag | Purpose | Example Modifiers |
|------|------------|---------|-------------------|
| `btn` | `<button>` | Button | `pri`, `sec`, `gh`, `out`, `lg`, `sm`, `r` |
| `txt` | `<p>` | Text / Typography | `h1`, `h2`, `p`, `sub`, `cen`, `xl` |
| `nav` | `<nav>` | Navbar | `gls`, `fix`, `dk`, `sticky` |
| `sec` | `<section>` | Section | `dk`, `hero` |
| `stk` | `<div>` | Stack (flex) | `v`, `h`, `ctr`, `wrap`, `gap` |
| `grd` | `<div>` | CSS Grid | `2`, `3`, `4` |
| `cnt` | `<div>` | Container | `mx`, `sm`, `lg` |
| `card` | `<div>` | Card | `out`, `sm`, `lg`, `int` |
| `inp` | `<input>` | Input field | `txt`, `pwd`, `eml`, `num` |
| `sel` | `<select>` | Select / dropdown | — |
| `quote` | `<blockquote>` | Blockquote | — |
| `hero` | `<section>` | Hero section | `cen`, `left`, `dk` |
| `feat` | `<section>` | Feature section | `2`, `3`, `4` |
| `cta` | `<section>` | Call to action | `cen`, `dk`, `lg` |
| `ft` | `<footer>` | Footer | `dk`, `cen`, `sm` |
| `tab` | `<div>` | Tabs | `h`, `v` |
| `lst` | `<ul>` | List | `ul`, `ol`, `none`, `inline` |
| `div` | `<hr>` | Divider | `sm`, `lg` |
| `spn` | `<span>` | Spinner | `sm`, `lg`, `col` |
| `img` | `<img>` | Image | `rnd`, `full`, `circle`, `shadow` |
| `icon` | `<span>` | Icon placeholder | `sm`, `md`, `lg` |
| `lnk` | `<a>` | Link | `pri`, `sec`, `nav` |
| `code` | `<code>` | Code block | `block`, `inline` |
| `h1` | `<h1>` | Heading 1 | — |
| `h2` | `<h2>` | Heading 2 | — |
| `h3` | `<h3>` | Heading 3 | — |
| `frm` | `<form>` | Form | — |
| `lbl` | `<label>` | Label | `sm` |
| `txa` | `<textarea>` | Textarea | `sm`, `lg` |
| `chk` | `<input type="checkbox">` | Checkbox | — |
| `swt` | `<button>` | Switch / toggle | `sm`, `lg` |
| `rad` | `<div>` | Radio group | `h`, `v` |
| `bge` | `<span>` | Badge | `subtle`, `pri` |
| `ava` | `<span>` | Avatar | `sm`, `md`, `lg` |

### Edit Overrides (`edi $prop::value`)

Use to override CSS or props on any component:

| Prop | Maps To | Example | Result |
|------|---------|---------|--------|
| `$bg` | `style.background` | `edi $bg::#ff5733` | `style="background: #ff5733"` |
| `$col` | `style.color` | `edi $col::white` | `style="color: white"` |
| `$pd` | `style.padding` | `edi $pd::12px` | `style="padding: 12px"` |
| `$mg` | `style.margin` | `edi $mg::0` | `style="margin: 0"` |
| `$w` | `style.width` | `edi $w::100%` | `style="width: 100%"` |
| `$h` | `style.height` | `edi $h::200px` | `style="height: 200px"` |
| `$fs` | `style.font-size` | `edi $fs::1.5rem` | `style="font-size: 1.5rem"` |
| `$fw` | `style.font-weight` | `edi $fw::bold` | `style="font-weight: bold"` |
| `$br` | `style.border-radius` | `edi $br::8px` | `style="border-radius: 8px"` |
| `$gap` | `style.gap` | `edi $gap::16px` | `style="gap: 16px"` |
| `$txt` | Content override | `edi $txt::"New"` | Replaces `:"content"` |
| `$src` | `src` attribute | `edi $src::/img.png` | `src="/img.png"` |
| `$alt` | `alt` attribute | `edi $alt::"desc"` | `alt="desc"` |
| `$key` | React key in iteration | `$key::id` | `key={item.id}` |

**Important:** Boolean and numeric values auto-coerce for correct React rendering:
- `edi $required::true` → `required={true}` (not `required="true"`)
- `edi $minlength::3` → `minLength={3}` (camelCase auto-mapped)
- `edi $pattern::"[a-z]+"` → `pattern="[a-z]+"` (regex via quoted values)

**htmlToReact auto-mapping** (lowercase HTML → React camelCase):
- `minlength` → `minLength`
- `maxlength` → `maxLength`
- `readonly` → `readOnly`
- `tabindex` → `tabIndex`

---

## Events (`!handler::callback`)

| Pattern | Output | Notes |
|---------|--------|-------|
| `!onClick::handleClick` | `onClick={handleClick}` | Direct passthrough |
| `inp @q !onChange::setQ` | `onChange={(e) => setQ(e.target.value)}` | Auto-wraps when state+event match |
| `!onSubmit::handleSubmit` | `onSubmit={(e) => { e.preventDefault(); handleSubmit(e) }}` | Auto-preventDefault |

---

## State (`@varName`)

Declare state variables inline. Compiles to `useState('')`:

```
inp::txt @query
```
→ `const [query, setQuery] = useState('')` and `<input value={query} .../>`

State + event auto-binding: when `@query` and `!onChange::setQuery` are on the same component, the generated onChange auto-extracts `e.target.value`:

```tsx
onChange={(e) => setQuery(e.target.value)}
```

---

## Children & Nesting

| Syntax | Meaning | Example | Output |
|--------|---------|---------|--------|
| `> child` | Direct child | `nav > btn` | `<nav><button/></nav>` |
| `+ child` | Horizontal sibling | `stk::h > a + b` | One row, side by side |
| `^ child` | Vertical sibling | `stk::v > a ^ b` | One column, stacked |

---

## Iteration

### Literal count
```
*3 > card
```
→ 3 copies of `<Card/>`

### State-driven
```
*@items > card
```
→ `{items.map((item, i) => <Card key={i} />)}`

### With stable key
```
*@items > card $key::id
```
→ `key={item.id}` (recommended over index)

### Nested
```
*@categories > *@items > card
```
→ Nested `.map()`, outer item accessible as `item.items`

---

## Conditionals (`?@variable | trueBranch | falseBranch`)

```
?@isAdmin | btn::del:"Delete" | txt:"No access"
```
→ `{isAdmin ? <button>Delete</button> : <p>No access</p>}`

### Expression conditionals (operators: `>`, `<`, `>=`, `<=`, `==`, `!=`)
```
?@count > 0 | spn | txt:"Empty"
?@role == 'admin' | btn::pri:"Panel" | txt:"Guest"
```
→ `{count > 0 ? <span/> : <p>Empty</p>}`
→ `{role == 'admin' ? <button>Panel</button> : <p>Guest</p>}`

### Without false branch (renders `&&`)
```
?@loading | spn
```
→ `{loading && <Spinner/>}`

---

## Slots (Named Children)

```
card > [header]txt::h1:"Title" [body]txt:"Content" [footer]btn:"OK"
```

Each `[slotName]` becomes a JSX prop on the parent:
```tsx
<Card header={<h1>Title</h1>} body={<p>Content</p>} footer={<button>OK</button>} />
```

---

## Animations (`~name`)

10 built-in CSS animations. Append any number to a component:

| Token | Effect | Default Duration |
|-------|--------|------------------|
| `~fade` | Fade in | 300ms |
| `~slide` | Slide up | 300ms |
| `~bounce` | Bounce in | 300ms |
| `~zoom` | Scale in | 300ms |
| `~flip` | 3D flip | 300ms |
| `~lift` | Float up | 300ms |
| `~glow` | Glow pulse | 300ms |
| `~pulse` | Opacity pulse | 300ms |
| `~shake` | Shake | 300ms |
| `~spin` | Spin | 300ms |

Duration is customizable: `~slide500` = slide over 500ms. Output includes `@keyframes` CSS and `animation-duration` inline style when non-default.

```
btn::pri ~fade ~bounce
```
→ `<button className="anim-fade anim-bounce" style="animation-duration: 300ms">`

---

## Parenthesized Groups

```
nav > (btn::pri + btn::sec)
```

Groups children under one parent without a wrapper component (renders as React Fragment).

---

## Multi-line Pages

Each line is a top-level expression. Multi-line output wraps in `<main>`:

```
nav::gls::fix > btn::pri:"Get Started"
sec::hero::dk > txt::h1::xl:"Welcome"
```

---

## Comments

Lines starting with `#` are skipped entirely. Can be full-line or after a component:

```
# This is a comment
nav::gls > btn::pri:"Click"  # inline comment
```

---

## Mode: Default vs --lib

| Mode | Output | Use Case |
|------|--------|----------|
| **Default** | HTML tags + Tailwind utility classes (e.g. `bg-blue-600 text-white`) | Projects already using Tailwind CSS |
| **`--lib`** | React component imports (e.g. `import { Button } from "@/components/ui/button"`) | Projects using shadcn/ui or custom component library |

---

## Example Gallery

See [`examples/`](../examples/) for runnable `.wfl` files:

| File | Features |
|------|----------|
| `button.wfl` | 4 button variants (primary, secondary, ghost, outline) |
| `navbar.wfl` | Glass/fixed navbar with logo, links, and CTA button |
| `form.wfl` | Form with state (`@query`, `@email`), events, auto-binding |
| `card-grid.wfl` | 3-column grid with iteration (`*3 > card`) |
| `conditional.wfl` | Ternary conditional rendering (`?@isAdmin \| ...`) |
| `animated-hero.wfl` | Hero with 3 animations (slide, fade, bounce) + CSS keyframes |

---

## Output Format

The `compile()` function returns:

```typescript
{
  imports: [{ path: string, name: string }],  // component imports needed
  jsx: string,                                  // JSX markup
  css: string,                                  // animation @keyframes CSS
  stateCode: string,                            // useState declarations
}
```

Use `formatComponentOutput(output, name?)` to wrap in a complete `.tsx` file:
```tsx
"use client";
import { useState } from "react";
export default function Page() {
  const [query, setQuery] = useState('');
  return (
    <nav className="...">
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
    </nav>
  );
}
```
