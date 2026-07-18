# AIC Dev — Human Gates & Budget

## Human gates

| # | Gate | Trigger condition | Who approves |
|---|------|-------------------|--------------|
| G1 | Pre-run sign-off | Before any iteration on real code | Loop owner |
| G2 | Verifier anomaly | Verifier fails after auto-retry | Loop owner |
| G3 | Merge / push | Before pushing to GitHub | Loop owner |
| G4 | Breaking change | Before changing types or public API | Loop owner |

### How to clear a gate
The loop writes a gate request, the owner reviews and approves, loop continues.

## Budget / stop

| Dimension | Limit | Action on breach |
|-----------|-------|-----------------|
| Max iterations per phase | 50 | Halt + write budget-exceeded |
| Max consecutive failures | 3 | Halt + escalate to human |
