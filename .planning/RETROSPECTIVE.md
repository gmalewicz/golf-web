# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: vcycle-2026 — 2026 Season Rules

**Shipped:** 2026-03-30
**Phases:** 4 | **Plans:** 4

### What Was Built
- CycleDetails2026Component with 20-position Grand Prix points scale and per-season tie-break logic
- AddCycleComponent validator updated to accept version = 2
- CycleDetailsVersionedBase abstract class extracting ~250 lines of shared code
- Cleaned up dead Protractor e2e config, documented Cypress as E2E solution

### What Worked
- Small, focused phases (1 plan each) kept execution fast and clean
- UAT testing after phases 1 and 2 caught issues early (all 10 tests passed)
- Extracting the shared base class in phase 3 after the feature was working was the right order — build first, refactor second
- Phase 4 (tech debt cleanup) fit naturally as a milestone finisher

### What Was Inefficient
- Phases 1 and 2 were done before full GSD scaffolding (no PLAN.md or SUMMARY.md), making archival less complete
- Phase 1 commit message ("Cycle 2026 season rules") bundled all phase 1+2 work into one commit

### Patterns Established
- Multi-version component pattern: each season's rules get a dedicated component extending a versioned abstract base
- Shared HTML template via relative `templateUrl` path across version components
- Season-specific methods stay in leaf components; shared logic moves to abstract base

### Key Lessons
1. When adding year-specific rules, create a new component per year rather than branching inside a single component — keeps seasons isolated
2. Refactoring to extract a base class works best after the feature is proven correct via UAT
3. Tech debt cleanup (like removing dead Protractor config) is low-risk and pairs well with feature milestones

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| vcycle-2026 | 4 | 4 | First GSD milestone; lightweight phases |

### Top Lessons (Verified Across Milestones)

1. Build feature first, refactor second — proven in vcycle-2026 phase 3

