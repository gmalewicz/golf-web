# Roadmap: golf-web

## Overview

Angular SPA for managing golf competitions - player registration, round recording, handicap tracking (WHS), online real-time scorecards, and multi-season cycle (league) standings with configurable Grand Prix point tables.

## Milestones

- ✅ **vcycle-2026 — 2026 Season Rules** — Phases 1-4 (shipped 2026-03-30)

## Phases

<details>
<summary>✅ vcycle-2026: 2026 Season Rules (Phases 1-4) — SHIPPED 2026-03-30</summary>

- [x] Phase 1: Cycle 2026 (1 plan)  — completed 2026-03-27
- [x] Phase 2: Add Cycle Validation (1 plan)  — completed 2026-03-27
- [x] Phase 3: Remove Duplications (1 plan)  — completed 2026-03-27
- [x] Phase 4: Remove Legacy Protractor (1 plan)  — completed 2026-03-30

</details>

### Phase 1: tech debt refactoring and bug fixes ✅

**Goal:** Eliminate all 743 ESLint errors (inject() migration, template strict equality, control flow, TypeScript type safety), consolidate dual CSS/SCSS stylesheets, and remove commented-out dead code for a clean, zero-lint-error codebase.
**Requirements**: TBD
**Depends on:** Phase 0
**Plans:** 4 plans
**Status:** COMPLETED 2026-03-31

Plans:
- [x] 01-01-PLAN.md — Migrate constructor injection to inject() function (330 errors, 92 files via Angular schematic)
- [x] 01-02-PLAN.md — Fix template eqeqeq and control flow lint errors (296 errors, 16 HTML files)
- [x] 01-03-PLAN.md — Fix TypeScript lint errors: any types, unused vars, prefer-const, misc (117 errors, 31 files)
- [x] 01-04-PLAN.md — Code cleanup: consolidate CSS/SCSS stylesheets and remove commented-out dead code

---

*For full milestone details, see [milestones/vcycle-2026-ROADMAP.md](milestones/vcycle-2026-ROADMAP.md)*
