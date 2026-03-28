# Coding Conventions

**Analysis Date:** 2026-03-26

## Naming Patterns

**Files:**
- Component files: `<kebab-case>.component.ts` — e.g., `round-view-whs.component.ts`
- Service files: `<camelCase>.service.ts` or `<camelCase>Http.service.ts` — e.g., `authentication.service.ts`, `scorecardHttp.service.ts`
- Guard files: `<name>.guard.ts` — e.g., `auth.guard.ts`, `role.guard.ts`
- Interceptor files: `<name>.interceptor.ts` or `MimicBackend<Feature>Interceptor.ts`
- Model files: `<camelCase>.ts` — e.g., `scoreCard.ts`, `playerRndCnt.ts`, `onlineRound.ts`
- Helper/utility files: descriptive dot-notation — e.g., `whs.routines.ts`, `common.ts`
- Barrel exports: always `index.ts`
- Spec files: `<source-file>.spec.ts` co-located with source
- Base classes: `<name>-base.ts` — e.g., `online-round-base.ts`, `cycle-details-base.ts`

**Classes:**
- Components: PascalCase with `Component` suffix — e.g., `RoundViewWhsComponent`
- Services: PascalCase with `Service` suffix — e.g., `AuthenticationService`, `RxStompService`
- Guards: PascalCase with `Guard` suffix — e.g., `AuthGuard`, `RoleGuard`
- Interceptors: PascalCase with `Interceptor` suffix — e.g., `ErrorInterceptor`, `SessionRecoveryInterceptor`
- Interfaces (models): PascalCase, no prefix/suffix — e.g., `Player`, `Round`, `OnlineRound`
- Abstract base classes: PascalCase with `Base` suffix — e.g., `OnlineRoundBaseComponent`, `CycleDetailsBase`

**Functions/Methods:**
- camelCase — e.g., `calculateScoreDifferential()`, `getPlayedCoursePar()`, `onNext()`
- Event handlers: `on<Action>` prefix — e.g., `onClick()`, `onChange()`, `onNext()`, `onPrevious()`
- Lifecycle: `ngOnInit()`, `ngOnDestroy()` (standard Angular)
- Private helper methods: camelCase with `_` prefix — e.g., `_ifTokenExpired()`, `_checkTokenExpiryErr()`

**Variables/Fields:**
- camelCase for standard fields
- Angular Signals: `<name>Sgn` suffix for signal fields — e.g., `onlineRoundsSgn`, `curHoleIdxSgn`, `loadingDelSgn`
- `readonly` prefix for injected dependencies: `private readonly httpService: HttpService`
- Form groups: camelCase with `Form` suffix — e.g., `loginForm`
- Form controls: camelCase describing field — e.g., `emailControl`

**Constants / Enums:**
- Exported `const` objects with UPPER_SNAKE property values — e.g., `teeTypes.TEE_TYPE_18`, `teeTypes.TEE_TYPE_FIRST_9`
- Named numeric constants: `const ballPickedUpStrokes = 16`, `const HALF_HOLES`

## Code Style

**Formatting:**
- EditorConfig (`.editorconfig`) enforces baseline formatting
- No Prettier detected; formatting is manually maintained

**Linting:**
- ESLint with `@typescript-eslint/eslint-plugin` and `@angular-eslint/eslint-plugin`
- Config: `.eslintrc.js` (legacy format) + `eslint.config.mjs` (flat config)
- Key rules: `deprecation/deprecation: warn` (via `eslint-plugin-deprecation`)
- lint command: `eslint -c .eslintrc.js --ext .ts src/app`

## Import Organization

**Order (observed pattern):**
1. Angular core/common (`@angular/core`, `@angular/common`, `@angular/forms`, etc.)
2. Angular Material (`@angular/material/*`)
3. RxJS (`rxjs`, `rxjs/operators`)
4. Third-party libraries (`@fortawesome/*`, `@stomp/*`, `ng2-charts`)
5. App path-alias imports (`@/_models`, `@/_services`, `@/_helpers`)
6. Relative imports within feature (`../`, `./`)

**Path Aliases:**
- `@/*` resolves to `src/app/*` (defined in `tsconfig.json`)
- Example: `import { Player } from '@/_models'` → `src/app/_models/index.ts`
- Feature cross-references use `@/<feature>/...` — e.g., `import { OnlineRound } from '@/scorecard/_models'`

## Standalone Components

**Pattern:** All components are standalone (Angular 21 default)
- `standalone: true` is NOT explicitly declared (it is the default in Angular 21)
- Each component declares its own `imports: [...]` array with needed Material modules, directives, child components
- Example:
```typescript
@Component({
    selector: 'app-rounds',
    templateUrl: './rounds.component.html',
    imports: [NgClass, ListRoundsComponent, RouterLink]
})
export class RoundsComponent implements OnInit, OnDestroy { ... }
```

## Angular Signals Usage

**Pattern:** Angular Signals used for component-level reactive state, especially in online scorecard feature
- Fields named with `Sgn` suffix: `signal<Type>(initialValue)`
- Mutate via `.set()`, `.update()`, spread when updating arrays: `mySgn.set([...mySgn()])`
- Read-only signals: `.asReadonly()`
- Example:
```typescript
onlineRoundsSgn = signal<OnlineRound[]>([]);
curHoleIdxSgn = signal<number>(0);
public pageSize = signal<number>(5).asReadonly();
```

## Error Handling

**Patterns:**
- HTTP errors centralized in `ErrorInterceptor` — components do not catch HTTP errors themselves
- Navigation errors always caught with `.catch(error => console.log(error))`
- Form errors displayed via template-driven validation (Angular Material `<mat-error>`)
- Alert messages via `AlertService.error()` / `AlertService.success()`
- `throwError(() => new Error(String(err.status)))` pattern in interceptors

## Logging

**Framework:** None (console only)

**Patterns:**
- `console.log(error)` only in navigation `.catch()` handlers
- `console.error(err)` only at bootstrap level in `src/main.ts`
- No debug logging in production code

## Comments

**When to Comment:**
- Sparse inline comments for non-obvious logic
- Version notes as inline comments — e.g., `// v2.20 update JWT not to break on-line round`
- `// NOSONAR` applied to suppress SonarCloud rules selectively — e.g., `src/main.ts`
- Commented-out code left in some files (e.g., disabled STOMP debug logging in `golfRxStompConfig.ts`)

**JSDoc/TSDoc:**
- Not used; no JSDoc comments observed in source files

## Function Design

**Size:** Methods are concise; complex operations extracted into helper functions (e.g., `whs.routines.ts`)
**Parameters:** Typically 2–4 parameters; complex config passed as objects
**Return Values:** Services return `Observable<T>`; guards return `boolean`; utilities return primitive values

## Module Design

**Exports:**
- Use barrel `index.ts` files in `_models/`, `_services/`, `_helpers/` directories
- Feature models export via `src/app/<feature>/_models/index.ts`

**Barrel Files:**
- Present in `_models/`, `_services/`, `_helpers/` at app root and in most feature directories
- Used to simplify imports: `import { Player, Round } from '@/_models'`

## Internationalization

**Pattern:** Angular i18n with `$localize` template tag
- Syntax: `$localize`:@@<key>:<default-text>``
- Applied in: component TypeScript code for dynamic strings (alerts, error messages)
- Applied in: templates using `i18n` attribute
- Polish locale translation file: `src/translate/messages.pl.xlf`

---

*Convention analysis: 2026-03-26*
