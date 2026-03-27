# Milestone cycle-2026 — Project Summary

**Generated:** 2026-03-27
**Purpose:** Team onboarding and project review
**Branch:** `cycle-2026`
**Last release tag:** `13.4.0`

---

## 1. Project Overview

**golf-web** is an Angular 21 single-page application for managing golf competitions.
It covers the full lifecycle of a golf season: player registration, round recording,
handicap tracking (WHS), online real-time scorecards (via STOMP WebSocket), and
multi-season cycle (league) standings with configurable Grand Prix point tables.

**Target users:**
- Golf club members — view results, play online rounds, track handicap
- Club administrators — manage courses, tournaments, seasons, and player accounts

**This milestone** delivered support for the **2026 season rules** in the cycle (league)
standings feature, making it possible to create and manage cycles under the updated
2026 Grand Prix scoring system without breaking 2025 or legacy cycles.

---

## 2. Architecture & Technical Decisions

### Multi-version cycle details pattern

- **Decision:** Each year's competition rules are encapsulated in a dedicated component
  (`CycleDetails2025Component`, `CycleDetails2026Component`) rather than branching
  inside a single component.
  - **Why:** Keeps year-specific point tables and tie-break algorithms isolated;
    allows parallel coexistence of multiple active seasons without risk of regression.
  - **Implemented in:** Phase 01
  - **Route discriminator:** `cycle.version` field (0 = legacy, 1 = 2025, 2 = 2026)
  - **Routing:** `cycles.component.ts` `cyclesRoutes` maps `cycleDetails2026` path

### 2026 Grand Prix points scale

- **Decision:** Replace the 15-position 2025 table with a 20-position 2026 table.
  - **Why:** Rule change for the 2026 season — broader points distribution, higher ceiling.
  - **2025 scale (15 positions):** `[20, 17, 14, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]`
  - **2026 scale (20 positions):** `[26, 22, 19, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]`
  - Positions beyond 20th receive 1 pt (same fallback as 2025)

### Max cycle version validation bump

- **Decision:** Update `Validators.max(2)` in `AddCycleComponent` (was `max(1)`).
  - **Why:** Without this change, administrators could not create cycles with
    `version = 2` through the UI; the form would reject valid input.
  - **Implemented in:** Phase 02

### Tie resolution for multi-round tournaments (2026)

- **Decision:** The 2026 component adds a detailed tie-break array (`tieArray`) before
  sorting classifications, comparing 6 tiebreaker criteria in order:
  1. Total STB net score
  2. Last round STB net score
  3. Last 9 holes STB net
  4. Last 6 holes STB net
  5. Last 3 holes STB net
  6. Last hole STB net
  7. Lower handicap (as final tiebreaker)
  - **Why:** Formalizes the tie-breaking procedure used in competitive stroke-play events.

### Stroke play series as a separate series 2

- **Decision:** Results from the stroke play category are stored as `series: 2` inside
  the `EagleResultSet`, separate from the Grand Prix HCP-A/B/C categories (`series: 1`).
  - **Why:** Enables separate sorting and display tabs for Grand Prix vs stroke play
    in the cycle results UI.

---

## 3. Phases Delivered

| Phase | Name | Status | One-liner |
|-------|------|--------|-----------|
| 01 | cycle-2026 | ✅ complete | Add CycleDetails2026 component with 2026 Grand Prix points and version-based routing |
| 02 | add-cycle-validation | ✅ complete | Bump max cycle version to 2 and fix Polish i18n validation message |

---

## 4. Requirements Coverage

Derived from UAT files (no formal REQUIREMENTS.md present for this milestone):

| Requirement | Status |
|---|---|
| Cycles with `version == 2` navigate to `CycleDetails2026Component` | ✅ Pass |
| Cycles with `version == 1` still navigate to `CycleDetails2025Component` (regression) | ✅ Pass |
| Cycles with `version == 0` still navigate to original `CycleDetailsComponent` (regression) | ✅ Pass |
| 2026 Grand Prix top-20 shows correct points (1st = 26, 2nd = 22, 3rd = 19, etc.) | ✅ Pass |
| Players in 20th place or lower all receive exactly 1 pt | ✅ Pass |
| Admin can add a tournament to a 2026 cycle successfully | ✅ Pass |
| Admin can close a 2026 cycle | ✅ Pass |
| Add Cycle form accepts `version = 2` without validation error | ✅ Pass |
| Add Cycle form rejects `version = 3` with max-version error | ✅ Pass |
| Polish locale validation message reads "zasady od 2026" (typo fixed, year updated) | ✅ Pass |

**Total: 10 / 10 requirements met. No gaps.**

---

## 5. Key Decisions Log

| ID | Decision | Phase | Rationale |
|---|---|---|---|
| D-01 | Add dedicated `CycleDetails2026Component` | 01 | Isolates year-specific logic; avoids branching in shared component |
| D-02 | Route via `cycle.version == 2` in `cycles.component.html` | 01 | Consistent with existing version-dispatch pattern from 2025 |
| D-03 | New 20-position Grand Prix table starting at 26 pts | 01 | 2026 season rule change; more winners recognised |
| D-04 | Add `tieArray` for multi-round tie resolution | 01 | Formalises the competition tie-breaking procedure |
| D-05 | Bump `Validators.max` from 1 to 2 in `AddCycleComponent` | 02 | Unblocks admin ability to create 2026 cycles in the UI |
| D-06 | Fix Polish translation typo: "zaady" → "zasady" | 02 | Visible localisation bug in the Polish locale build |
| D-07 | Extend `Cycle` model comment to document `version = 2` | 02 | In-code documentation for future contributors |

---

## 6. Tech Debt & Deferred Items

### Existing (pre-milestone, from codebase analysis)

- **Dual ESLint config** — `.eslintrc.js` and `eslint.config.mjs` coexist; authorititative config is ambiguous
- **JWT in localStorage** — XSS risk; consider `httpOnly` cookies if backend supports it
- **No `ChangeDetectionStrategy.OnPush`** on any components — missed performance opportunity
- **Legacy Protractor `e2e/` directory** — should be deleted; Cypress is the active E2E suite
- **`any` type usage in tests** — several spec files use untyped mocks
- **`PreloadAllModules` in router** — pre-loads all route bundles immediately; consider targeted preloading

### Introduced this milestone

- `CycleDetails2026Component` inherits from `CycleDetailsBase` via constructor injection (class-based DI). The Angular guidelines recommend `inject()` — acceptable technical debt for consistency with the existing 2025 component.
- No `changeDetection: ChangeDetectionStrategy.OnPush` added to new component (consistent with project convention but sub-optimal).
- `processSingleRoundTournament`, `processMultiRoundTournament`, and related helpers use `any` typed parameters from the Eagle API response. Typing these would require a formal Eagle API model.

---

## 7. Getting Started

### Run the project

```bash
# Development server (proxies API calls to localhost:8080)
ng serve

# Polish locale build
ng build --localize

# Production build
ng build --configuration=production
```

### Run tests

```bash
ng test                    # Watch mode
ng test --watch=false      # Single run
ng test --code-coverage    # With lcov coverage
```

### Key directories for this feature

```
src/app/cycles/
├── cycle-details-2026/         ← NEW: 2026 cycle details component (phase 01)
│   ├── cycle-details-2026.component.ts     ← main logic + Grand Prix table
│   ├── cycle-details-2026.component.html   ← tabbed view: results | tournaments | stroke play
│   └── cycle-details-2026.component.spec.ts
├── add-cycle/
│   ├── add-cycle.component.ts  ← version field validation updated (phase 02)
│   └── add-cycle.component.html
├── base/
│   └── cycle-details-base.ts   ← shared base class for all cycle detail views
├── _models/
│   └── cycle.ts                ← Cycle interface (version field: 0=legacy, 1=2025, 2=2026)
└── cycles/
    └── cycles.component.ts     ← route table; dispatches by cycle.version
```

### Where to look first

- **Entry point for cycles:** [src/app/cycles/cycles/cycles.component.ts](src/app/cycles/cycles/cycles.component.ts) — route definitions and `cyclesRoutes`
- **2026 logic:** [src/app/cycles/cycle-details-2026/cycle-details-2026.component.ts](src/app/cycles/cycle-details-2026/cycle-details-2026.component.ts) — Grand Prix points, sorting, tie resolution
- **Shared base:** `src/app/cycles/base/cycle-details-base.ts` — `init()`, tournament fetching, loading state
- **Data model:** `src/app/cycles/_models/cycle.ts` — `Cycle` interface and `CycleStatus` constants
- **Polish i18n:** `src/translate/messages.pl.xlf` — updated `addCycle-VersionLower` translation unit

---

## Stats

- **Timeline:** 2026-03-11 → 2026-03-15
- **Phases:** 2 / 2 complete
- **Commits since v13.4.0:** 9 (including 1 dependabot bump)
- **Files changed:** 53 (+651 / -295)
- **Contributors:** Grzegorz Malewicz, dependabot[bot]
