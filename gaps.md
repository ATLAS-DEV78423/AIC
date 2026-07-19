# WFL — Gap Analysis

> Living document cataloging every gap between current WFL and production-ready.
> Updated as phases are completed and new gaps identified.

---

## Status Legend

| Marker | Meaning |
|--------|---------|
| 🔴 Not started | Not yet addressed in any phase |
| 🟡 Partial | Addressed but needs more work |
| 🟢 Done | Handled in a completed phase |
| ⚪ Won't fix | Explicitly deferred (why noted) |

---

## 1. Runtime Behavior Gaps

These affect whether generated output actually works correctly at runtime.

### 1.1 Smart Event Binding — 🟢 Done (Phase 12)

**Fix:** Generator detects `!onChange` + `@state` on same component and auto-wraps `(e) => setState(e.target.value)`. `!onSubmit` auto-wraps with `e.preventDefault()`. `!onClick` passes event directly.

### 1.2 Iteration Keys — 🟢 Done (Phase 10)

**Fix:** `$key::id` stores `iterationKey` in resolver; generator emits `key={item.id}`. Falls back to `key={i}` (array index).

### 1.3 String Interpolation in Iteration Context — 🟢 Done

**Analysis:** `{item.title}` in content passes through literally to JSX output. In iteration context, `item` is the `.map()` callback parameter, so `{item.title}` evaluates correctly at runtime. This works already.

### 1.4 String Interpolation in State Context — 🟢 Done

**Analysis:** `{name}` in content passes through literally to JSX output. State variables declared via `@name` generate `const [name, setName] = useState('')` before the JSX, so `{name}` evaluates correctly at runtime. This works already.

### 1.5 Conditional False Branch Import Registration — 🟢 Done (Phase 2)

**Analysis:** Generator's `generateJSX` recursively processes `conditional.falseBranch`, adding its component imports. Verified working.

### 1.6 Auto State-Value Binding — 🟢 Done (Phase 3)

**Problem:** `@query` on an `inp` didn't auto-add `value={query}`.
**Fix:** Generator now adds `value={varName}` to props when `component.state` is set.

### 1.7 Default Content — 🟢 Done (Phase 3)

**Problem:** `btn::pri` produced empty content — needed `btn::pri:"Click"` to have text.
**Fix:** Registry entries have `defaultContent`; resolver falls back to it when no `:"..."` content is given.

### 1.8 Event Handler Definitions — 🔴 Not started

**Problem:** No way to define actual handler logic in WFL. Events reference callbacks that must exist externally (`onClick={handleClick}`). For AI-generated output, the handler bodies need to come from somewhere.

**Possible approaches:**
- Inline handler bodies: `!onClick::console.log("clicked")`
- Handler definitions as sibling syntax: `ev onClick > console.log("clicked")`
- Multi-line event definitions: separate ev: lines
- Let the AI include handler definitions as a companion output alongside the JSX

### 1.9 Form Validation — 🟢 Done (Phase 12)

**Fix:** `$required::true` → boolean coercion `required={true}`. `$minlength::3` → numeric + camelCase `minLength={3}`. `$pattern::"[a-z]+"` → regex patterns via quoted values. `!onSubmit` auto-wraps with `e.preventDefault()`. `htmlToReact` map for `minlength→minLength`, `maxlength→maxLength`, `readonly→readOnly`, `tabindex→tabIndex`.

### 1.10 Async / Data Fetching — 🔴 Not started

**Problem:** No way to express data loading, loading states, or error boundaries in WFL.

**Desired:**
- `*@fetch(/api/users) > card` — fetch-based iteration
- `?@loading | spn | content` — loading state conditional
- Error boundary wrapper component

---

## 2. Component System Gaps

### 2.1 Component Slots / Named Children — 🔴 Not started

**Problem:** All children are rendered in a single slot. Layout components (cards, dialogs, sections) need named slots like header, body, footer, actions.

**Desired:** Slot syntax like `card > [header]txt::h1:"Title" [body]txt:"Content" [footer]btn:"OK"`

### 2.2 Configurable/Extendable Registry — 🔴 Not started

**Problem:** The registry is an in-memory TypeScript object. Adding custom components requires modifying source code.

**Desired:**
- Load registry from JSON/YAML config file
- CLI flag `--registry my-components.json`
- Merge multiple registry sources
- Support for custom import paths and npm packages

### 2.3 Component Composition / Reuse — 🔴 Not started

**Problem:** No way to define a reusable WFL component and reference it elsewhere. Each expression is self-contained.

**Desired:**
- WFL component definitions: `def card > stk::v > img ^ txt::p ^ btn`
- Reference them: `> card ^ card`
- Parameter passing: `card title="Hello"`

### 2.4 Server Components / RSC Compatibility — 🔴 Not started

**Problem:** Generated output uses `useState`, `React.Fragment`, and client-side patterns. No server component mode.

**Desired:** `--rsc` flag that skips useState/event handlers and generates server-compatible output.

### 2.5 Self-Contained Visual Output — 🟢 Done (Phase 9.5)

**Problem:** Registry entries referenced external React components (`@/components/ui/button`) that don't ship with the package. Generated output was non-functional without installing an external component library. Zero visual quality from a fresh install.

**Fix:** Rewrote default registry to map WFL codes directly to HTML tags + Tailwind CSS utility classes:
```
btn::pri → <button className="bg-blue-600 text-white hover:bg-blue-700...">
```
Old component-based registry preserved as `REGISTRY_LIB` with `--lib` flag for backward compatibility.

---

## 3. Build / Output Gaps

### 3.1 Full Component File Output — 🟢 Done (Phase 11)

**Fix:** `formatComponentOutput(output, name?)` wraps compile output in complete `"use client"` .tsx file with imports, useState declarations, JSX, and CSS `<style>` tag.

### 3.2 Source Maps — 🔴 Not started

**Problem:** When generated JSX errors, there's no way to trace back to the WFL source line/column.

### 3.3 TypeScript Type Generation — 🔴 Not started

**Problem:** Generated output has no TypeScript types on props, events, or state.

**Desired:** Optional type output based on registry entry prop types.

### 3.4 Bundler Integration — 🔴 Not started

**Problem:** No webpack/vite/Next.js plugin. Users must manually integrate `compile()` into their build pipeline.

**Desired:**
- Vite plugin: `import page from './page.wfl'`
- Next.js loader: `.wfl` files importable in pages
- Webpack loader

---

## 4. Language / Parser Gaps

### 4.1 Nested Iteration — 🟢 Done (Phase 7)

**Problem:** `*@categories > *@items > card` — iteration inside iteration isn't supported. The inner `*@items` would be parsed as a child expression, but the resolver/generator doesn't handle nested iteration.

**Fix:** Generator `generateJSX` now has a `depth` parameter. State-ref iterations at depth > 0 prefix the state variable with `item.` and pass `depth + 1` to children. Resolver doesn't propagate `iterationKey` from child iteration to parent. Parser already handled the AST.

### 4.2 Complex Conditionals (else if) — 🔴 Not started

**Problem:** `?@role | admin_panel | ?@role | moderator_panel | guest_view` — nested conditionals work structurally but the pattern is verbose.

**Desired:** `?@role == admin | admin_panel | ?@role == mod | mod_panel | guest_view` or chained syntax.

### 4.3 Expression Evaluation in Conditionals — 🟢 Done (Phase 7)

**Problem:** `?@user` checks truthiness. No way to write `?@count > 0` or `?@role === 'admin'`.

**Fix:** Lexer pattern `CONDITIONAL` extended to capture `?@var op value`. Generator's `.replace('?@', '')` passes the comparison through to JSX naturally.

### 4.4 Error Recovery — 🟢 Done (Phase 7)

**Problem:** One syntax error (e.g., missing `>`, unknown component) kills the entire compile. No partial output, no error location beyond position, no suggestions.

**Fix:** Parser errors now include token position context. Resolver's "unknown component" error lists known components. Full error recovery (partial output on error) deferred — ponytail: better messages cover 90% of the UX need.

### 4.5 WFL File Format / Multi-File — 🔴 Not started

**Problem:** No `.wfl` file extension, no import/export between files, no project-level compilation.

---

## 5. Developer Experience Gaps

### 5.1 Syntax Highlighting — 🔴 Not started

**Problem:** No VS Code extension, TextMate grammar, or syntax highlighter for `.wfl` files.

### 5.2 Formatting — 🔴 Not started

**Problem:** No `wfl fmt` command. AI-generated WFL can have inconsistent spacing, line breaks, and token ordering.

### 5.3 Linting / Validation — 🔴 Not started

**Problem:** No `wfl check` that validates component names, modifier existence, required props, unused variables, etc.

### 5.4 Error Messages — 🟡 Partial

**Problem:** Errors currently say things like "Unknown component token" and "Expected > after iteration". Better messages would include the position, surrounding context, and suggestions.

### 5.5 CLI — 🟢 Done (Phase 11)

**Fix:** Full CLI with `wfl compile`, `wfl build`, `--out`, `--registry`, `--lib`, `--version`/`-v`, `--help`/`-h`. Inline expression mode for ad-hoc use. Directory compilation for project-level builds.

### 5.6 IDE Integration — 🔴 Not started

**Problem:** No LSP server that provides autocomplete, hover info, go-to-definition, or diagnostics for WFL files in any editor.

---

## 6. Testing / Quality Gaps

### 6.1 Edge Case Coverage — 🟢 Done (Phase 9)

**Tests added for:**
- Empty children
- Deeply nested trees (200 levels)
- Unicode in content (emoji, CJK)
- Mixed whitespace (tabs, newlines)
- Extremely long modifier chains (30 modifiers)
- State + iteration + conditional in one expression
- Empty string content
- Multi-feature multi-line pages

### 6.2 Fuzzing — 🟢 Done (Phase 9)

**Fuzz harness:** 200 random WFL expressions generated from component/operator fragments, piped through full compile pipeline. 133/200 compiled OK, 67 graceful rejects, 0 crashes. Deterministic seed (42) for reproducibility.

### 6.3 Regression Test Suite — 🔴 Not started

**Problem:** No golden file tests. Changes to the generator could silently alter output without any existing test failing.

### 6.4 Compression Benchmarking — 🟢 Done (Phase 9)

**Benchmark:** 9 expressions across patterns (simple, child, multi-line, iteration, conditional, state+event, slot). Average compression: 3.24×. Minimum per-pattern thresholds guard against regression.

---

## 7. Documentation Gaps

### 7.1 Language Reference — 🔴 Not started

**Problem:** No single document that describes every token, syntax rule, component, modifier, and edit override.

### 7.2 Migration Guide — 🔴 Not started

**Problem:** No guide for converting existing React components to WFL.

### 7.3 Examples Gallery — 🟢 Done (Phase 11)

**Done:** 6 example `.wfl` files covering button variants, navbar, form with state/events, card grid with iteration, conditional rendering, and animated hero with CSS keyframes.

### 7.4 API Documentation — 🔴 Not started

**Problem:** No generated docs for the compile API, registry API, or plugin API.

---


## Completed Phases

| Phase | Focus | Gaps Closed |
|-------|-------|-------------|
| 0 | Core DSL | Basic components, modifiers, content, children, siblings, events (verification phase) |
| 1 | Animations & Enhanced Registry | Animation tokens (~fade), multi-line pages, hero/feature/cta/footer/tabs/list/divider/spinner components |
| 2 | Language Completeness | Iteration, conditionals, state management, full edit overrides, form components, parentheses |
| 3 | Interactive Components | Auto state-value binding, default content |
| **7** | **Language Completeness** | **Nested iteration (4.1), Expression conditionals (4.3), Error recovery (4.4)** |
| **9** | **Production Hardening** | **Edge cases (6.1), Fuzzing (6.2), Benchmarks (6.4)** |
| **9.5** | **Tailwind-Native Output** | **Self-contained HTML + Tailwind CSS (2.5)** |
| **10** | **Code Cleanup** | **Removed dead code (variantProps, createRegistry, ThemeNode), cleanup (1.2)** |
| **11** | **Production Polish** | **Comments, h1/h2/h3 TYPE fix, examples gallery (7.3), CLI polish (5.5), Full component output (3.1)** |
| **12** | **Form Validation & Events** | **Boolean/numeric coercion, event auto-binding (1.1), form validation (1.9), htmlToReact mapping** |
