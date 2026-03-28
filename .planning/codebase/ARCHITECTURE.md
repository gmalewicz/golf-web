# Architecture

**Analysis Date:** 2026-03-26

## Pattern Overview

**Overall:** Feature-based Angular SPA with layered architecture per feature module

**Key Characteristics:**
- No NgModules — fully standalone components (Angular 21)
- Lazy-loaded feature areas via router `loadChildren`
- Shared global services (`_services/`, `_helpers/`, `_models/`) at app root
- Feature-scoped services, models, and helpers co-located under feature directories
- HTTP interceptor pipeline for auth, session recovery, and player data sync

## Layers

**Models (`_models/`):**
- Purpose: Pure TypeScript interfaces, no logic
- Location: `src/app/_models/` (global), `src/app/<feature>/_models/` (feature-scoped)
- Contains: `Player`, `Round`, `Course`, `Hole`, `ScoreCard`, `Tee`, `Format`, etc.
- Depends on: Nothing
- Used by: Services, components

**Services (`_services/`):**
- Purpose: HTTP communication, authentication state, alert messaging
- Location: `src/app/_services/` (global), `src/app/<feature>/_services/` (feature-scoped)
- Contains: `HttpService`, `AuthenticationService`, `AlertService`, domain HTTP services
- Depends on: `HttpClient`, `_models/`, `@angular/router`
- Used by: Components, interceptors

**Helpers (`_helpers/`):**
- Purpose: Guards, interceptors, WHS calculation logic, utility functions, test utilities
- Location: `src/app/_helpers/` (global), `src/app/<feature>/_helpers/` (feature-scoped)
- Contains: `AuthGuard`, `RoleGuard`, `ErrorInterceptor`, `SessionRecoveryInterceptor`, `PlayerDataInterceptor`, `whs.routines.ts`, `common.ts`
- Depends on: `_services/`, `_models/`, `@angular/router`
- Used by: App bootstrap (`main.ts`), routing

**Components:**
- Purpose: UI rendering and user interaction
- Location: `src/app/<feature>/<component>/`
- Contains: Standalone Angular components with templates, styles
- Depends on: `_services/`, `_models/`, `_helpers/`, Angular Material
- Used by: Router

**Base Classes (abstract):**
- Purpose: Shared behavior inheritance for related component families
- Examples:
  - `src/app/scorecard/_helpers/online-round-base.ts` — base for all online scorecard components
  - `src/app/cycles/base/cycle-details-base.ts` — base for cycle detail views
  - `src/app/cycles/base/cycle-results-base.ts` — base for cycle results views
  - `src/app/_helpers/dialog.base.ts` — base for WHS-editing dialogs
  - `src/app/dialogs/create-or-search-dialog-base.ts` — base for player create/search dialogs

## Data Flow

**Standard HTTP Request Flow:**

1. Component calls domain HTTP service method (e.g., `HttpService.getRounds()`)
2. `PlayerDataInterceptor` intercepts GET responses on specific URLs, extracts `hcp` and `sex` headers, updates `AuthenticationService` storage
3. `SessionRecoveryInterceptor` intercepts HTTP 999 errors, refreshes JWT, retries request
4. `ErrorInterceptor` intercepts remaining errors (998, 403, 0, 404, 500, 504, 401), shows alert, navigates appropriately
5. Observable result returned to component

**Authentication Flow:**

1. User submits login form → `AuthenticationService.login()` → `POST rest/Authenticate`
2. JWT + player data stored in `localStorage` under key `currentPlayer`
3. `BehaviorSubject<Player>` updated, all subscribers notified
4. Route guards (`AuthGuard`, `RoleGuard`) check `currentPlayerValue` synchronously

**Online Scorecard Real-time Flow:**

1. `RxStompService` fetches WebSocket endpoint from `assets/app-config.json`
2. JWT refreshed before WebSocket activation (`updateJWT().subscribe(...)`)
3. STOMP connection over `wss://` or `ws://` based on protocol
4. Score updates published/subscribed via STOMP topics
5. Angular Signals used for all reactive UI state in scorecard components

**State Management:**
- Global auth state: `BehaviorSubject<Player>` in `AuthenticationService`
- Navigation state: Angular `signal<>()` in feature navigation services (e.g., `RoundsNavigationService`)
- Component state: Angular Signals (`signal<>()`) in base classes and components
- No NgRx or other external state management library

## Key Abstractions

**HttpService (global):**
- Purpose: All non-feature-specific REST API calls
- Examples: `src/app/_services/http.service.ts`
- Pattern: Injectable service, methods return `Observable<T>`

**Domain HTTP Services:**
- Purpose: Feature-specific API calls
- Examples: `src/app/course/_services/courseHttp.service.ts`, `src/app/tournament/_services/tournamentHttp.service.ts`, `src/app/scorecard/_services/scorecardHttp.service.ts`, `src/app/cycles/_services/cycleHttp.service.ts`, `src/app/mp-league/_services/leagueHttp.service.ts`
- Pattern: `@Injectable({ providedIn: 'root' })`, methods return `Observable<T>`

**Navigation Services:**
- Purpose: Preserve pagination/tab state across component destroy/init cycles
- Examples: `src/app/rounds/roundsNavigation.service.ts`, `src/app/scorecard/_services/navigation.service.ts`, `src/app/tournament/_services/tournamentNavigation.service.ts`
- Pattern: `@Injectable()` with Angular `signal<>()` fields; `clear()` / `restoreLast()` methods

**MimicBackend Interceptors (test-only):**
- Purpose: In-memory HTTP mock for unit/integration tests
- Examples: `src/app/_helpers/MimicBackendAppInterceptor.ts`, `src/app/course/_helpers/MimicBackendCourseInterceptor.ts`, `src/app/scorecard/_helpers/MimicBackendScoreInterceptor.ts`, `src/app/tournament/_helpers/MimicBackendTournamentInterceptor.ts`, `src/app/cycles/_helpers/MimicBackendCycleInterceptor.ts`, `src/app/mp-league/_helpers/MimicBackendMpLeaguesInterceptor.ts`
- Pattern: `HttpInterceptor` returning hardcoded `Observable<HttpResponse<T>>`

## Entry Points

**Application Bootstrap:**
- Location: `src/main.ts`
- Triggers: Browser load
- Responsibilities: Bootstraps `AppComponent` with providers (interceptors, router, HTTP client, charts, i18n, Material modules)

**Root Component:**
- Location: `src/app/app.component.ts`
- Responsibilities: Renders `NavigationComponent`, `AlertComponent`, `<router-outlet>`

**Router:**
- Location: `src/app/app.routing.ts`
- Pattern: Eager routes for core pages; lazy-loaded routes for feature areas (`scorecard`, `course`, `addCourse`, `tournaments`, `cycles`, `mpLeagues`)
- Guards: `AuthGuard` on most routes; `RoleGuard('ADMIN')` on `/admin`

## Error Handling

**Strategy:** Centralized via HTTP interceptor chain + `AlertService`

**Patterns:**
- HTTP 998 → logout + redirect to `/login` + persistent alert
- HTTP 999 → JWT refresh + retry original request (via `SessionRecoveryInterceptor`)
- HTTP 403 → alert "Access denied" + redirect to root
- HTTP 0/404/500/504 → alert "Application not available" + redirect to root
- HTTP 401 (expired) → alert + redirect to `/login`
- HTTP 401 (other) → alert + redirect to root
- Non-HTTP errors → `console.error` only at bootstrap level

## Cross-Cutting Concerns

**Logging:** None (no logging framework); only `console.log`/`console.error` in error paths
**Validation:** Reactive forms with `Validators` (Angular Forms); WHS range validated via `Validators.pattern` + `Validators.min/max`
**Authentication:** JWT in `localStorage`; applied by Spring Boot backend (not Angular request headers directly)
**Internationalization:** Angular i18n with `$localize` template tag; English (en-US) and Polish (`pl`) locales; XLIFF file at `src/translate/messages.pl.xlf`

---

*Architecture analysis: 2026-03-26*
