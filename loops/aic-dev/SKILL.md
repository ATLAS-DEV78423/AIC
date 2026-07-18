---
name: aic-dev
description: >
  Self-running loop: WFL (Web Formation Language) is production-ready —
  all tasks complete, code compiles, tests pass, quality checks pass.
---

# AIC Development Loop

## Goal

**Exit predicate:** WFL is production-ready — can generate beautiful, visually appealing websites with transitions, animations, and micro-interactions. All implementation tasks pass verification.

## Conventions

This file is **read-only at runtime.** All changing state goes in `STATE.md`.

## Pattern: ReAct + deterministic verifier

Each iteration:
1. **Read state** — load `STATE.md` for current position
2. **Discover** — check the plan for the next pending task
3. **Act** — implement the task (TypeScript, ponytail simplicity)
4. **Verify** — run the verifier (tests + compile + quality)
5. **On fail** — analyze root cause, fix, retry
6. **Write state** — update STATE.md, commit, push
7. **Check exit** — if all tasks done, stop

## How to run

```
Start the aic-dev loop. Read STATE.md, run one iteration.
```

## What "done" means

- All Phase 0-4 tasks complete and verified
- Tests pass (`npx vitest run`)
- TypeScript compiles (`npx tsc --noEmit`)
- Code quality check passes
- WFL can generate complete, animated, production-quality websites
