# WFL Production Readiness

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make WFL publishable and production-ready — proper package config, CI, clean state, polished README.

**Architecture:** The core pipeline (lexer → parser → resolver → generator) is solid. This plan adds the packaging, CI, and docs layer around it — zero changes to the compiler pipeline itself.

**Tech Stack:** TypeScript, Vitest, GitHub Actions, npm

---

### Task 1: Publish-Ready Package Configuration

**Files:**
- Modify: `package.json`
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Update package.json with production fields**

Add `"types"`, `"engines"`, and `"publishConfig"` fields. Also add a `"prepublish"` build script to ensure dist is fresh before publish.

Edit `package.json`:
- Add `"types": "dist/index.d.ts"` below `"main"`
- Add `"engines": { "node": ">=18" }`
- Add `"publishConfig": { "access": "public" }`
- Change `"prepublishOnly": "npm run build"` to `"prepublish": "npm run build"` (prepublishOnly runs before publish, prepublish runs on npm install too — prepublishOnly is correct, keep it)

- [ ] **Step 2: Create GitHub Actions CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test
      - run: npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add package.json .github/workflows/ci.yml
git commit -m "chore: publish-ready package config and CI pipeline"
```

---

### Task 2: Clean Up Working Tree

**Files:**
- Delete: `test/debug-tokens.ts` (already staged deletion — it's ` D` in status)
- Handle: `test/efficiency-test.ts` (untracked)

- [ ] **Step 1: Remove debug-tokens.ts from index**

This file is already deleted from disk but staged. Commit the deletion:

```bash
git rm test/debug-tokens.ts
```

- [ ] **Step 2: Keep efficiency-test.ts but add to .gitignore**

This is a useful manual testing tool. Add it to `.gitignore`:

Append to `.gitignore`:
```
test/efficiency-test.ts
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: clean up working tree — remove stale debug file, ignore utility test"
```

---

### Task 3: README Polish

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add Tailwind CSS requirement note**

The default registry emits Tailwind utility classes. Users need Tailwind CSS in their project. Add a note near the top of README.

- [ ] **Step 2: Add API Reference section**

The README already has an API Reference section (lines 291-303). Clean up the wording, ensure it covers `compile()` options (registry parameter) and `formatComponentOutput()`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add Tailwind requirement note and polish API reference"
```

---

### Task 4: Final Code Review

Use `code-review` skill to review the full diff of all changes.

- [ ] **Step 1: Run code review**

```bash
# Use the code-review skill to review all changes
```

- [ ] **Step 2: Apply any fixes from review**

- [ ] **Step 3: Final commit with fixes**

```bash
git add -A
git commit -m "chore: code review fixes"
```
