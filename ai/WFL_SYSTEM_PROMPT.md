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
| grd | Grid | 2, 3, 4 |
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

1. Components start with 2-4 lowercase letters
2. Use `::` between a type and its modifiers
3. Use `>` for nesting, `+` for horizontal siblings, `^` for vertical
4. Use `edi` to override any property
5. Use `!` for events, `@` for state, `*` for repetition, `?` for conditionals
6. String content in double quotes after `:`
7. `$` prefix for style properties in edits

## Output Format

Write ONE WFL expression per line. The transpiler converts to React/Next.js automatically.
