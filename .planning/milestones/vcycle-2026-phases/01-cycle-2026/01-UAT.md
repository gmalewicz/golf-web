---
status: complete
phase: 01-cycle-2026
source: [conversation]
started: 2026-03-27T00:00:00Z
updated: 2026-03-27T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Navigate to 2026 Cycle Details
expected: In the cycles list, a cycle with version == 2 shows a magnifying glass link. Clicking it navigates to the cycleDetails2026 route and loads the CycleDetails2026Component.
result: pass

### 2. Navigate to 2025 Cycle Details (regression)
expected: A cycle with version == 1 still navigates to cycleDetails2025 and loads CycleDetails2025Component correctly.
result: pass

### 3. Navigate to legacy Cycle Details (regression)
expected: A cycle with version == 0 still navigates to cycleDetails and loads the original CycleDetailsComponent correctly.
result: pass

### 4. Grand Prix Points — 2026 top-20 positions
expected: After adding a tournament to a 2026 cycle, the Grand Prix Stableford tab shows the correct 2026 points scale: 1st place = 26 pts, 2nd = 22, 3rd = 19, 4th = 17, down to 19th = 2 pts.
result: pass

### 5. Grand Prix Points — 2026 positions beyond 20th
expected: Players finishing in 20th place or lower (20th, 21st, 22nd, …) each receive exactly 1 pt in the Grand Prix classification.
result: pass

### 6. Add tournament to 2026 cycle
expected: An admin can open a 2026 cycle, click "Add tournament", fill in the dialog, and the tournament is successfully added without errors. The cycle results update accordingly.
result: pass

### 7. Close 2026 cycle
expected: An admin can close a 2026 cycle using the "Close cycle" button. The cycle status changes to Closed and the button disappears.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
