# Phase 1: Tech Debt Refactoring and Bug Fixes — Research

**Researched:** 2026-03-31
**Discovery Level:** 0 (internal patterns, established Angular migrations)

## Summary

Phase 1 addresses 743 ESLint errors across the codebase plus minor tech debt items. All work follows established Angular migration patterns — no new external dependencies or unfamiliar integrations.

## Lint Error Breakdown

| Rule | Count | Fix Approach |
|------|-------|-------------|
| `@angular-eslint/prefer-inject` | 330 (89 files) | Angular schematic: `ng generate @angular/core:inject` |
| `@angular-eslint/template/eqeqeq` | 247 | Manual: replace `==` with `===` and `!=` with `!==` in templates |
| `@typescript-eslint/no-explicit-any` | 61 | Manual: replace `any` with proper types |
| `@angular-eslint/template/prefer-control-flow` | 49 (1 file) | Manual: tournament-results template (schematic blocked by duplicate `#showDetails` ng-template) |
| `@typescript-eslint/no-unused-vars` | 27 | Manual/auto-fix: remove or prefix with `_` |
| `prefer-const` | 19 | Auto-fixable via `ng lint --fix` |
| `no-useless-assignment` | 8 | Manual: remove or restructure |
| `@angular-eslint/component-selector` | 1 | Manual: fix selector prefix |
| `@typescript-eslint/no-array-constructor` | 1 | Manual: use `[]` instead of `new Array()` |

## Standard Stack (No New Dependencies)

All fixes use existing Angular CLI schematics and ESLint auto-fix. No new libraries needed.

### Angular Schematics Available

1. **`ng generate @angular/core:inject`** — Auto-migrates constructor DI → `inject()` function. Verified working (92 files would be updated). Note: requires `ng analytics disable` first due to npm version detection bug.

2. **`ng generate @angular/core:control-flow`** — Migrates `*ngIf`/`*ngFor` to `@if`/`@for`. **Blocked** on `tournament-results.component.html` due to duplicate `#showDetails` ng-template name. Must rename duplicates first, then run schematic, or migrate manually.

### ESLint Auto-Fix

`ng lint --fix` can auto-fix ~20 errors (primarily `prefer-const`).

## Architecture Patterns

No architectural changes needed. All work is mechanical refactoring within existing patterns.

### inject() Migration Pattern
```typescript
// Before (constructor injection)
constructor(private readonly httpService: HttpService) {}

// After (inject function)
private readonly httpService = inject(HttpService);
```

### Control Flow Migration Pattern
```html
<!-- Before -->
<div *ngIf="condition">content</div>
<div *ngFor="let item of items">{{item}}</div>

<!-- After -->
@if (condition) { <div>content</div> }
@for (item of items; track item) { <div>{{item}}</div> }
```

### Template eqeqeq Pattern
```html
<!-- Before -->
<div *ngIf="value == 'test'">

<!-- After -->
@if (value === 'test') {
```

## Don't Hand-Roll

- **inject() migration** — Use the Angular schematic, don't manually refactor 89 files
- **prefer-const** — Use `ng lint --fix`, don't manually edit 19 occurrences

## Common Pitfalls

1. **inject() in abstract base classes**: The schematic handles this, but verify that `inject()` calls in abstract base classes don't break subclass initialization order
2. **Template eqeqeq with null checks**: `== null` checks both `null` and `undefined` — changing to `=== null` changes semantics. Review each `== null` case carefully.
3. **Control flow migration with ng-template refs**: Duplicate `#showDetails` in `tournament-results.component.html` blocks the schematic — rename to unique names first
4. **Test breakage after inject() migration**: The schematic preserves behavior, but run tests after to confirm. Particularly watch for `TestBed.configureTestingModule` changes.

## Tech Debt Items (from CONCERNS.md)

### Still Valid
- **Dual CSS/SCSS entry points**: Both `src/styles.css` and `src/style.scss` loaded in `angular.json`. Need to audit and consolidate.
- **Commented-out code**: In `golfRxStompConfig.ts` (debug logging), `player.ts` (token fields), `environment.ts` (WS_ENDPOINT)
- **`any` types in tests**: 61 `no-explicit-any` errors across codebase

### Already Fixed (vcycle-2026)
- ~~Legacy Protractor e2e directory~~ — Removed in Phase 4
- ~~Dual ESLint configuration~~ — Only `eslint.config.mjs` remains

## Test Baseline

- **388 unit tests**: All passing (4.2s execution)
- **Framework**: Karma 6.4.x + Jasmine 6.1.x
- **Quick run**: `ng test --watch=false`

## Validation Architecture

### Test Infrastructure
- Framework: Karma + Jasmine (existing)
- Quick run: `ng test --watch=false` (~4s)
- Full suite: `ng test --watch=false` + `ng lint` (~30s total)
- Lint: `ng lint` via `eslint.config.mjs`

### Verification Strategy
Each plan verified by:
1. `ng test --watch=false` — All 388 tests still pass (no regressions)
2. `ng lint` — Error count decreases by expected amount per plan
3. `ng build` — Build succeeds

### Sampling Rate
- After each task: `ng test --watch=false` (4s)
- After each plan wave: `ng test --watch=false` + `ng lint`
- Before verify: Full suite green + zero lint errors

---

*Research: 2026-03-31*
