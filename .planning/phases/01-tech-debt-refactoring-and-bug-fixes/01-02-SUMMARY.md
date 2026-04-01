---
phase: 01-tech-debt-refactoring-and-bug-fixes
plan: 02
subsystem: refactoring
tags: [angular, templates, eqeqeq, control-flow, strict-equality]

requires: []
provides:
  - "Zero @angular-eslint/template/eqeqeq lint errors"
  - "Zero @angular-eslint/template/prefer-control-flow lint errors"
  - "All 16 HTML templates use strict equality (=== / !==)"
  - "tournament-results template fully migrated to @if/@for"
affects: []

tech-stack:
  added: []
  patterns:
    - "@if/@for/@else control flow blocks (Angular built-in)"

key-files:
  created: []
  modified:
    - "16 .html template files (strict equality)"
    - "src/app/tournament/tournament-results/tournament-results.component.html (control flow)"

key-decisions:
  - "Used truthy checks instead of === null where original != null guarded both null and undefined"
  - "Ran control-flow schematic after manually renaming duplicate #showDetails templates"

patterns-established: []

requirements-completed: []

duration: 10min
completed: 2026-03-31
---

# Phase 01 Plan 02: Fix Template Lint Errors Summary

**Eliminated 296 template lint errors: 247 eqeqeq violations fixed to strict equality and 49 prefer-control-flow violations migrated to @if/@for.**

## Performance

- **Duration:** 10 min
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Replaced all `==`/`!=` with `===`/`!==` across 16 HTML template files
- Fixed null-guard semantics where `!= null` covered both null and undefined
- Migrated tournament-results template from *ngIf/*ngFor to @if/@for/@else
- All 388 unit tests pass

## Task Commits

1. **Task 1: Fix eqeqeq violations** - `ad74cd3` (fix)
2. **Task 2: Migrate control flow** - `149e4c0` (refactor)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Null guard semantic changes**
- **Found during:** Task 1 (eqeqeq replacement)
- **Issue:** `!= null`/`!= undefined` checks both null and undefined; replacing with `!== null`/`!== undefined` broke null guards when values were the opposite nullish type
- **Fix:** Changed affected patterns to truthy checks (e.g., `players && players.length` instead of `players !== undefined && players.length`)
- **Files modified:** search-player-dialog, rounds, online-score-card-view, player-selector, tournament-results, player-results
- **Verification:** All 388 tests pass

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)

## Issues Encountered
None.

## Next Phase Readiness
Ready for Plan 01-04 (CSS/code cleanup) and then Plan 01-03 (TypeScript lint errors, Wave 2).

---
*Phase: 01-tech-debt-refactoring-and-bug-fixes*
*Completed: 2026-03-31*
