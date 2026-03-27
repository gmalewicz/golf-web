# Codebase Structure

**Analysis Date:** 2026-03-26

## Directory Layout

```
golf-web/
├── src/
│   ├── app/
│   │   ├── _helpers/           # Global guards, interceptors, utilities
│   │   ├── _models/            # Global interfaces/types
│   │   ├── _services/          # Global services (auth, HTTP, alert)
│   │   ├── add-scorecard/      # Add scorecard feature
│   │   ├── admin/              # Admin panel (players, reset PW, move course)
│   │   ├── alert/              # Alert/notification display component
│   │   ├── change-log/         # App changelog view
│   │   ├── confirmation-dialog/ # Reusable confirmation dialog
│   │   ├── course/             # Single course view + tees + add course
│   │   ├── courses/            # Course listing
│   │   ├── cycles/             # Golf cycles feature (season competitions)
│   │   ├── dialogs/            # Shared dialog components (player search/register)
│   │   ├── home/               # Home page component
│   │   ├── login/              # Login + social login finish dialog
│   │   ├── mp-league/          # Match play league feature
│   │   ├── navigation/         # Top navigation bar component
│   │   ├── registration/       # Player registration component
│   │   ├── round/              # Single round view (multiple format views)
│   │   ├── rounds/             # Rounds listing + navigation service
│   │   ├── scorecard/          # Online real-time scorecard feature (STOMP)
│   │   ├── tournament/         # Tournament management feature
│   │   ├── update-player/      # Player profile update
│   │   ├── app.component.ts    # Root component
│   │   ├── app.component.html  # Root template
│   │   └── app.routing.ts      # Application routes
│   ├── assets/
│   │   ├── app-config.json     # Runtime WebSocket endpoint config
│   │   ├── app-config-test.json
│   │   ├── app-config-local-k8s.json
│   │   └── img/                # Static images
│   ├── environments/
│   │   ├── environment.ts      # Dev environment config
│   │   └── environment.prod.ts # Production environment config  
│   ├── translate/
│   │   └── messages.pl.xlf     # Polish i18n translations
│   ├── index.html              # App shell HTML
│   ├── main.ts                 # Bootstrap entry point
│   ├── style.scss              # Global styles (SCSS)
│   ├── styles.css              # Global styles (CSS)
│   └── test.ts                 # Karma test entry point
├── cypress/
│   ├── e2e/                    # E2E test specs (login, mainPage, register)
│   ├── fixtures/               # Cypress test data
│   ├── plugins/                # Cypress plugins
│   └── support/                # Cypress commands and setup
├── e2e/                        # Legacy Protractor E2E (deprecated)
├── coverage/                   # Test coverage output (lcov)
├── config/
│   └── deployment.yml          # Kubernetes deployment manifest
├── angular.json                # Angular CLI workspace config
├── package.json                # NPM dependencies
├── tsconfig.json               # TypeScript root config
├── tsconfig.app.json           # App-specific TS config
├── tsconfig.spec.json          # Test-specific TS config
├── karma.conf.js               # Karma test runner config
├── cypress.config.ts           # Cypress E2E config
├── .eslintrc.js                # ESLint config (TypeScript rules)
├── .eslintrc.json              # ESLint config (alternate)
├── eslint.config.mjs           # ESLint flat config
├── Dockerfile                  # Production Docker build
├── dev-Dockerfile              # Development Docker build
├── httpd-ssl.conf              # Apache HTTPS config
├── my-httpd.conf               # Apache HTTP config
└── .firebaserc                 # Firebase project config
```

## Directory Purposes

**`src/app/_helpers/`:**
- Purpose: Cross-cutting application helpers
- Contains: `AuthGuard`, `RoleGuard`, HTTP interceptors (`ErrorInterceptor`, `SessionRecoveryInterceptor`, `PlayerDataInterceptor`), WHS calculation (`whs.routines.ts`), utility functions (`common.ts`), global test helper (`test.helper.ts`), mock HTTP interceptor (`MimicBackendAppInterceptor.ts`)
- Key files: `src/app/_helpers/whs.routines.ts`, `src/app/_helpers/error.interceptor.ts`, `src/app/_helpers/session.interceptor.ts`

**`src/app/_models/`:**
- Purpose: Shared TypeScript interfaces
- Contains: `Player`, `Round`, `Course`, `Hole`, `ScoreCard`, `Tee`, `Format`, `Version`, `Message`, etc.
- Key files: `src/app/_models/index.ts` (barrel), `src/app/_models/player.ts`, `src/app/_models/round.ts`

**`src/app/_services/`:**
- Purpose: Global injectable services
- Contains: `HttpService` (all global REST calls), `AuthenticationService` (JWT + BehaviorSubject), `AlertService` (notification bus)
- Key files: `src/app/_services/http.service.ts`, `src/app/_services/authentication.service.ts`

**`src/app/<feature>/`:**
- Purpose: Self-contained feature area
- Standard sub-structure:
  - `_helpers/` — feature-specific guards/interceptors/mock backends
  - `_models/` — feature-specific interfaces with `index.ts` barrel
  - `_services/` — feature HTTP service + navigation service
  - `base/` — abstract base classes (where applicable)
  - `<component>/` — one directory per component

**`src/app/scorecard/`:**
- Purpose: Real-time online scorecard (most complex feature)
- Key files: `src/app/scorecard/_services/rx-stomp.service.ts`, `src/app/scorecard/_helpers/online-round-base.ts`, `src/app/scorecard/online-score-card-view/formats/`

**`src/assets/`:**
- Purpose: Static files served with the app
- Key: `app-config.json` must have correct `wsEndpoint` value in each deployment

## Key File Locations

**Entry Points:**
- `src/main.ts`: Application bootstrap with all providers
- `src/app/app.routing.ts`: Route definitions

**Configuration:**
- `angular.json`: Angular build config, locales, assets, environments
- `tsconfig.json`: Path aliases (`@/*` → `src/app/*`)
- `src/environments/environment.ts`: Dev backend URL
- `src/assets/app-config.json`: Runtime WebSocket config

**Core Logic:**
- `src/app/_helpers/whs.routines.ts`: WHS handicap calculation algorithms
- `src/app/_services/authentication.service.ts`: JWT auth state management
- `src/app/_helpers/session.interceptor.ts`: JWT auto-refresh

**Testing:**
- `src/app/_helpers/test.helper.ts`: Global test fixtures
- `src/app/_helpers/MimicBackendAppInterceptor.ts`: Global HTTP mock
- Per-feature `MimicBackend*Interceptor.ts` files for isolated feature testing

## Naming Conventions

**Files:**
- Components: `<feature-name>.component.ts` (kebab-case)
- Services: `<name>.service.ts` or `<name>Http.service.ts`
- Guards: `<name>.guard.ts`
- Interceptors: `<name>.interceptor.ts` or `MimicBackend<Feature>Interceptor.ts`
- Models: `<camelCase>.ts` (e.g., `scoreCard.ts`, `playerRndCnt.ts`)
- Specs: `<filename>.spec.ts` co-located with source
- Base classes: `<name>-base.ts` or `<name>.base.ts`
- Barrel files: `index.ts`
- Helpers: `<name>.ts` with descriptive names (e.g., `whs.routines.ts`, `common.ts`)

**Directories:**
- Feature areas: kebab-case (`add-scorecard`, `mp-league`, `change-log`)
- Private sub-dirs: `_helpers`, `_models`, `_services` (underscore prefix)
- Component sub-dirs: kebab-case matching component selector

## Where to Add New Code

**New Feature:**
- Create `src/app/<feature-name>/` directory
- Add `_models/`, `_services/` sub-directories as needed
- Primary code: `src/app/<feature-name>/<component>/<component>.component.ts`
- Tests: `src/app/<feature-name>/<component>/<component>.component.spec.ts`
- Register lazy route in `src/app/app.routing.ts` using `loadChildren`

**New Component in Existing Feature:**
- Implementation: `src/app/<feature>/<component-name>/<component-name>.component.ts`
- Template: `src/app/<feature>/<component-name>/<component-name>.component.html`
- Test: `src/app/<feature>/<component-name>/<component-name>.component.spec.ts`

**New Global Model:**
- Add interface to `src/app/_models/<name>.ts`
- Export from `src/app/_models/index.ts`

**New Global Service:**
- Add to `src/app/_services/<name>.service.ts`
- Export from `src/app/_services/index.ts`

**New HTTP Endpoint (global):**
- Add method to `src/app/_services/http.service.ts`

**New HTTP Endpoint (feature-specific):**
- Add method to `src/app/<feature>/_services/<feature>Http.service.ts`

**Utilities / Pure Functions:**
- Golf handicap logic: `src/app/_helpers/whs.routines.ts`
- General utilities: `src/app/_helpers/common.ts`
- Feature-specific: `src/app/<feature>/_helpers/common.ts`

**i18n Strings:**
- Use `$localize` tag in TypeScript: `$localize`:@@key:Default text``
- Add Polish translation to `src/translate/messages.pl.xlf`

## Special Directories

**`coverage/`:**
- Purpose: lcov code coverage output from `ng test --coverage`
- Generated: Yes
- Committed: No (should be in .gitignore)

**`.angular/`:**
- Purpose: Angular CLI build cache
- Generated: Yes
- Committed: No

**`e2e/`:**
- Purpose: Legacy Protractor E2E tests (deprecated, replaced by Cypress)
- Generated: No
- Committed: Yes (legacy)

**`cypress/`:**
- Purpose: Cypress E2E tests for login, main page, registration flows
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-26*
