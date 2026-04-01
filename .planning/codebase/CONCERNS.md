# Codebase Concerns

**Analysis Date:** 2026-04-01

## Tech Debt

**Mixed CI/CD Approach:**
- Issue: Both Firebase Hosting (`.firebaserc`) and Docker/Apache (`Dockerfile`, `httpd-ssl.conf`) configs exist
- Files: `.firebaserc`, `Dockerfile`, `dev-Dockerfile`, `config/deployment.yml`, `httpd-ssl.conf`, `my-httpd.conf`, `dev-httpd.conf`
- Impact: Unclear which deployment path is authoritative; multiple configs to maintain
- Fix approach: Document which deployment method is active; archive unused config

**`eslint-disable` Inline Suppressions (16 occurrences):**
- Issue: `eslint-disable-next-line` comments suppress lint rules across multiple files
- Files:
  - `src/app/rounds/rounds/rounds.component.ts` — 2x `no-unused-expressions` (ternary as statement)
  - `src/app/cycles/cycle-details/cycle-details.component.ts` — 1x `no-explicit-any` (Eagle API response)
  - `src/app/_helpers/test.helper.ts` — 5x `no-unused-vars` (intentional unused params in mock factories)
  - `src/app/scorecard/_helpers/test.helper.ts` — 1x `no-unused-vars`
  - `src/app/scorecard/_helpers/online-round-base.ts` — 2x `no-unused-vars` (template method stubs)
  - `src/app/mp-league/league-player/league-player.component.ts` — 1x `no-unused-vars`
  - `src/app/tournament/tournament-players/tournament-players.component.ts` — 1x `no-unused-vars`
  - `src/app/dialogs/search-player-dialog/search-player-dialog.component.spec.ts` — 1x `no-unused-vars`
  - `src/app/dialogs/register-player-dialog/register-player-dialog.component.spec.ts` — 1x `no-unused-vars`
  - `src/app/tournament/update-tournament-player-whs-dialog/update-tournament-player-whs-dialog.component.spec.ts` — 1x `no-unused-vars`
- Impact: Suppressions hide genuine issues (ternary as statement, untyped API response) and mask intentional unused params
- Fix approach: Replace ternary-as-statements with `if/else`; type the Eagle API response; prefix intentional unused params with `_` to avoid needing suppressions

## Security Considerations

**JWT Stored in localStorage:**
- Risk: XSS attack can steal the JWT from `localStorage`
- Files: `src/app/_services/authentication.service.ts`
- Current mitigation: Angular's templating engine auto-escapes XSS by default; no explicit `innerHTML` binding observed
- Recommendations: Audit all `[innerHTML]` or `DomSanitizer` usage; consider `httpOnly` cookies for JWT if backend supports it

**Hardcoded Player Data in MimicBackend Interceptors:**
- Risk: Test interceptors ship with all production code (no tree-shaking for interceptors in providers)
- Files: `src/app/_helpers/MimicBackendAppInterceptor.ts` and all `MimicBackend*Interceptor.ts` files
- Current mitigation: Mock interceptors are only registered in `TestBed` providers, NOT in `main.ts` — safe in practice
- Recommendations: Confirm no `MimicBackend*` interceptor is ever accidentally registered in production bootstrap

**reCAPTCHA Dependency:**
- Risk: `ng-recaptcha@13.2.1` — external CDN dependency for captcha token; if service unavailable, registration fails
- Files: `src/app/registration/registration.component.ts`
- Current mitigation: Not detected; no timeout or fallback
- Recommendations: Add error handling for reCAPTCHA load failure

**Social OAuth2 Token via Query Parameter:**
- Risk: JWT passed as `?token=<jwt>` in redirect URL — token may appear in browser history, server logs, referrer headers
- Files: `src/app/login/login.component.ts`
- Current mitigation: Token is processed and removed from URL manipulation in component
- Recommendations: Backend should use POST redirect or fragment (`#`) for token delivery instead of query param

## Performance Bottlenecks

**Incomplete OnPush Change Detection Adoption:**
- Problem: Only 11 components use `ChangeDetectionStrategy.OnPush`; the majority still use the `Default` strategy
- Files with OnPush: `cycle-results`, `cycle-tournament`, `cycle-results-stroke-play`, `view-selector`, `course-info`, `round-view-fb-mp`, `info`, `player-selector`, `modification`, `tee-time`, `parameters`
- Cause: OnPush adoption started but not applied project-wide; remaining components still use Default
- Improvement path: Incrementally add `changeDetection: ChangeDetectionStrategy.OnPush` to components that use only Signals/Observables; prioritize high-traffic pages

**`PreloadAllModules` Strategy:**
- Problem: All lazy-loaded routes are preloaded immediately after initial load
- Files: `src/main.ts`
- Cause: `provideRouter(routing, withPreloading(PreloadAllModules))`
- Improvement path: For large feature bundles, consider `QuicklinkStrategy` or custom preloading based on user role

**WebSocket Reconnect on Every Page Load:**
- Problem: `RxStompService` makes HTTP call to `app-config.json` and refreshes JWT every time the service is instantiated
- Files: `src/app/scorecard/_services/rx-stomp.service.ts`
- Cause: Service is `providedIn: 'root'` so it persists, but `activate()` is called per component use
- Improvement path: Cache the app-config response; avoid re-activating already-active STOMP connections

## Fragile Areas

**Online Round Base Component (Signals + STOMP):**
- Files: `src/app/scorecard/_helpers/online-round-base.ts` and all extending components
- Why fragile: Complex combination of Angular Signals, RxJS, STOMP WebSocket, and manual array spreading for change detection
- Safe modification: Always spread signal arrays when mutating: `mySgn.set([...mySgn()])` — direct mutation will not trigger change detection
- Test coverage: Some spec files exist but complex async STOMP behavior is hard to unit test

**JWT Refresh Race Condition:**
- Files: `src/app/_helpers/session.interceptor.ts`
- Why fragile: Uses a `Subject` for JWT refresh and checks `refreshSubject.observed` to avoid duplicate refresh calls; relies on precise observable timing
- Safe modification: Do not add `async/await` patterns or change the Subject lifecycle; test carefully with parallel requests

**History-State Navigation Pattern:**
- Files: `src/app/cycles/base/cycle-details-base.ts`, tournament and mp-league detail components
- Why fragile: Passes data via `history.state.data` (router state); if user navigates directly to URL or refreshes page, `history.state.data` is `undefined`, triggering forced logout
- Safe modification: Always check `if (history.state.data === undefined)` before accessing; do not rely on this pattern for new features without a fallback fetch strategy

**Form Regex Validator:**
- Files: `src/app/_helpers/dialog.base.ts`
- Why fragile: WHS validation regex uses raw string with significant whitespace: `String.raw\`(-5(\.|,)0 | ...\`` — the spaces inside the regex are part of the pattern, likely unintentional
- Safe modification: Test regex thoroughly before modifying; the `Validators.min/max` provide a safety net

## Scaling Limits

**Pagination is Manual:**
- Current capacity: 5 rounds per page (`pageSize = signal<number>(5)`)
- Limit: All pagination is manual/client-driven with stateful navigation service
- Scaling path: Increase page size or implement virtual scrolling for large data sets

## Dependencies at Risk

**`ng-recaptcha` 13.2.1:**
- Risk: Package has historically had major version breaks with Angular major versions; currently on v13 vs Angular 21
- Impact: Registration form fails if incompatible with future Angular version
- Migration plan: Evaluate Google's official reCAPTCHA v3 integration or headless approach

**`@angular-devkit/architect` pinned to `0.2102.0`:**
- Risk: Exact pinned version `0.2102.0` in `devDependencies` while other Angular packages use `^21.x.x` semver range
- Files: `package.json`
- Impact: May cause version conflicts during upgrades
- Migration plan: Align to `^21.2.0` semver range

**Bootstrap 5.3.x alongside Angular Material:**
- Risk: Two UI frameworks in parallel (Bootstrap CSS + Angular Material) — potential CSS specificity conflicts
- Impact: Inconsistent styling, larger bundle size
- Migration plan: Audit usage; prefer Angular Material + CDK for all new components; remove Bootstrap if usage is minimal

## Missing Critical Features

**No Global Loading Indicator:**
- Problem: No app-wide HTTP loading spinner/progress bar
- Blocks: Users cannot tell when HTTP requests are in-flight after navigation
- Workaround: Individual components use local `loading*` boolean fields

**No Offline/Error Recovery for WebSocket:**
- Problem: If WebSocket connection fails permanently (beyond reconnect delay), online scorecard silently stops updating
- Files: `src/app/scorecard/_services/rx-stomp.service.ts`
- Blocks: Reliable online scorecard experience on poor connections

## Test Coverage Gaps

**WHS Calculation Functions:**
- What's not tested: `calculateScoreDifferential()` for 9-hole courses; edge cases for extreme WHS values
- Files: `src/app/_helpers/whs.routines.ts`
- Risk: Incorrect handicap calculations undetected
- Priority: High (core business logic)

**SessionRecoveryInterceptor:**
- What's not tested: Parallel requests during JWT refresh; race condition in `_ifTokenExpired()`
- Files: `src/app/_helpers/session.interceptor.ts`
- Risk: Duplicate JWT refresh or failed retry in concurrent-request scenarios
- Priority: High

**Social Login Flow:**
- What's not tested: `processSocialLogin()` and `processSocialLoginError()` in login component; `FinishSocialDialogComponent`
- Files: `src/app/login/login.component.ts`, `src/app/login/finish-social-dialog/finish-social-dialog.component.ts`
- Risk: OAuth2 callback handling regressions undetected
- Priority: Medium

**Online Scorecard Real-time (STOMP):**
- What's not tested: Actual STOMP message handling; WebSocket reconnection behavior
- Files: `src/app/scorecard/online-strokeplay/`, `src/app/scorecard/online-matchplay/`, `src/app/scorecard/online-fb-matchplay/`
- Risk: Real-time scoring bugs not caught by unit tests
- Priority: Medium

**Cypress E2E Coverage:**
- What's not tested: Scorecard submission flow, round management, admin functions, course management, tournament flow, cycle/league management
- Files: `cypress/e2e/` has only `login.js`, `mainPage.js`, `register.js`
- Risk: Core business flows (adding rounds, managing scorecards) have no E2E coverage
- Priority: Medium

---

*Concerns audit: 2026-04-01*
*Previous audit: 2026-03-26 — resolved: dual ESLint config, dual CSS/SCSS entry points, legacy Protractor e2e, `any` types in tests, commented-out dead code*
