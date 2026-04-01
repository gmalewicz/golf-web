---
phase: 01-tech-debt-refactoring-and-bug-fixes
plan: 01
subsystem: refactoring
tags: [angular, inject, dependency-injection, migration]

requires: []
provides:
  - "All 92 files migrated from constructor injection to inject() function"
  - "Zero @angular-eslint/prefer-inject lint errors"
affects: [01-03]

tech-stack:
  added: []
  patterns:
    - "inject() function for all dependency injection"

key-files:
  created: []
  modified:
    - "92 .ts files (services, components, guards, interceptors, base classes)"

key-decisions:
  - "Fixed 7 subclass super() edge cases manually after schematic run"
  - "Removed redundant protected property re-declarations in dialog and online-round subclasses"

patterns-established:
  - "inject() function pattern: all DI uses inject() at field level, no constructor parameters"

requirements-completed: []

duration: 8min
completed: 2026-03-31
---

# Phase 01 Plan 01: Migrate Constructor Injection to inject() Summary

**Migrated 92 files from constructor parameter injection to Angular's inject() function, eliminating 330 prefer-inject lint errors.**

## Performance

- **Duration:** 8 min
- **Tasks:** 2 (combined — schematic + edge case fixes)
- **Files modified:** 92

## Accomplishments
- Ran `ng generate @angular/core:inject` schematic across entire codebase
- Fixed 7 subclass `super()` call edge cases where schematic didn't handle inheritance properly
- Removed redundant `protected` property re-declarations in DialogBase and OnlineRoundBase subclasses
- All 388 unit tests pass, zero prefer-inject lint errors

## Task Commits

1. **Task 1+2: Run inject() migration + fix edge cases** - `0f68cfb` (refactor)

## Files Created/Modified
- 92 `.ts` files across services, components, guards, interceptors, and base classes
- Key base classes fixed: `dialog.base.ts`, `online-round-base.ts`
- Key subclasses fixed: `upd-dialog`, `finish-social-dialog`, `update-whs-dialog`, `update-tournament-player-whs-dialog`, `online-fb-matchplay`, `online-matchplay`, `online-strokeplay`

## Decisions Made
- Combined Task 1 (schematic run) and Task 2 (fix edge cases) into a single commit since the schematic edge cases were discovered and fixed in the same pass

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Schematic didn't handle abstract base class inheritance**
- **Found during:** Task 1 (inject() migration schematic)
- **Issue:** Schematic migrated base classes to inject() but left subclass `super()` calls passing arguments to now-parameterless constructors (7 files)
- **Fix:** Removed redundant `super()` arguments, redundant protected property re-declarations, and redundant local `inject()` calls in subclasses
- **Files modified:** `upd-dialog.component.ts`, `finish-social-dialog.component.ts`, `update-whs-dialog.component.ts`, `update-tournament-player-whs-dialog.component.ts`, `online-fb-matchplay.component.ts`, `online-matchplay.component.ts`, `online-strokeplay.component.ts`
- **Verification:** `ng test --watch=false` — 388/388 SUCCESS
- **Committed in:** `0f68cfb`

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Necessary fix — schematic has known limitation with abstract base class inheritance.

## Issues Encountered
None beyond the schematic edge case documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
Ready for Plan 01-02 (template lint fixes) and Plan 01-04 (CSS/code cleanup) — both are Wave 1 independent plans.

---
*Phase: 01-tech-debt-refactoring-and-bug-fixes*
*Completed: 2026-03-31*
