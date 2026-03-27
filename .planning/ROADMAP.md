# Roadmap: golf-web

## Overview

Angular SPA for managing golf competitions — player registration, round recording, handicap tracking (WHS), online real-time scorecards, and multi-season cycle (league) standings with configurable Grand Prix point tables.

## Milestone cycle-2026: 2026 Season Rules

### Phases

- [x] **Phase 1: Cycle 2026** — Add CycleDetails2026Component with 2026 Grand Prix points scale and tie-break logic
- [x] **Phase 2: Add Cycle Validation** — Update AddCycleComponent validator to accept version = 2

### Phase Details

### Phase 1: Cycle 2026

**Goal:** Add support for the 2026 season rules in cycle (league) standings — new component, updated points scale, tie-break algorithm, and routing.
**Requirements**: TBD
**Depends on:** Phase 0 (none)
**Plans:** complete

Plans:
- [x] 01-01: Implement CycleDetails2026Component (completed 2026-03-27)

### Phase 2: Add Cycle Validation

**Goal:** Update `Validators.max` in `AddCycleComponent` from `max(1)` to `max(2)` so administrators can create cycles with `version = 2` through the UI.
**Requirements**: TBD
**Depends on:** Phase 1
**Plans:** complete

Plans:
- [x] 02-01: Update AddCycleComponent validator (completed 2026-03-27)

### Phase 3: remove duplications in cycle-details cycle-details-2025 and cycle-details-2026

**Goal:** Extract the ~200 lines of identical TypeScript (addTournament pipeline, sortResults, five helper methods) and the byte-for-byte duplicate HTML template shared by CycleDetails2025Component and CycleDetails2026Component into a new abstract CycleDetailsVersionedBase class and a shared template, leaving each component with only its season-specific grandPrixPoints and processSingleRoundTournament.
**Requirements**: DEDUP-01
**Depends on:** Phase 2
**Plans:** 1 plan

Plans:
- [ ] 03-01-PLAN.md  Create CycleDetailsVersionedBase + shared HTML, slim down 2025/2026 components

---
