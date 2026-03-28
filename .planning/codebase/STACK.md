# Technology Stack

**Analysis Date:** 2026-03-26

## Languages

**Primary:**
- TypeScript 5.9.x - All application code (`src/**/*.ts`)
- HTML5 - Component templates (`src/**/*.html`)
- SCSS/CSS - Component styles (`src/**/*.scss`, `src/**/*.css`)

**Secondary:**
- JavaScript - Config files (`karma.conf.js`, `cypress/plugins/index.js`, `.eslintrc.js`)

## Runtime

**Environment:**
- Node.js (no `.nvmrc` detected; inferred from Angular CLI)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Angular 21.2.x (`@angular/core`, `@angular/router`, `@angular/forms`, `@angular/platform-browser`) - SPA framework
- Angular Material 21.2.x (`@angular/material`, `@angular/cdk`) - UI component library
- Angular i18n (`@angular/localize`) - Built-in internationalization (en-US + pl)

**State Management:**
- Angular Signals (built-in, Angular 21+) - Reactive local component state
- RxJS 7.8.x - Async streams for HTTP and service communication
- BehaviorSubject (RxJS) - Global auth state in `AuthenticationService`

**Testing:**
- Karma 6.4.x + Jasmine 6.1.x - Unit/integration test runner
- Cypress 15.7.x - End-to-end tests
- karma-coverage 2.2.x - Code coverage reporting (lcov format)

**Build/Dev:**
- Angular CLI 21.2.x (`ng`) - Project scaffolding and builds
- esbuild (via Angular DevKit 21.2.x) - Production bundler
- Webpack (via `@angular-devkit/build-angular`) - Dev server

## Key Dependencies

**Critical:**
- `@stomp/rx-stomp` 2.3.x + `@stomp/stompjs` 7.2.x - WebSocket/STOMP for real-time online scorecards
- `rxjs` 7.8.x - Observable streams throughout the app
- `ng-recaptcha` 13.2.x - Google reCAPTCHA on registration form
- `uuid` 11.0.x - UUID generation (likely for online round identifiers)

**UI:**
- Bootstrap 5.3.x - CSS grid/utilities supplementing Angular Material
- `@fortawesome/angular-fontawesome` 4.0.x + `@fortawesome/free-solid-svg-icons` 7.1.x - Icon library
- `ng2-charts` 10.0.x + `chart.js` 4.5.x - Charts for cycle/tournament results
- `primeicons` 7.0.x - Additional icon set

**Infrastructure:**
- `@angular/localize` - i18n with XLIFF translation (`src/translate/messages.pl.xlf`)

## Configuration

**Environment:**
- `src/environments/environment.ts` - Dev config (`production: false`, `URL_STR: 'http://localhost:8080/'`)
- `src/environments/environment.prod.ts` - Production config
- `src/assets/app-config.json` - Runtime config for WebSocket endpoint (`wsEndpoint`)
- `src/assets/app-config-test.json`, `src/assets/app-config-local-k8s.json` - Alt configs

**Build:**
- `angular.json` - Angular workspace config (multi-locale builds: en-US, pl)
- `tsconfig.json` - TypeScript root config with path alias `@/*` → `src/app/*`
- `tsconfig.app.json`, `tsconfig.spec.json` - App and test-specific TS configs

## Platform Requirements

**Development:**
- Node.js + npm
- Chrome (headless) for Karma tests

**Production:**
- Firebase Hosting (project: `valid-delight-259218`, see `.firebaserc`)
- Apache HTTP server (see `Dockerfile`, `httpd-ssl.conf`, `my-httpd.conf`)
- Backend REST API at `rest/*` (separate Spring Boot service at `localhost:8080` in dev)
- WebSocket server at endpoint configured in `app-config.json`

---

*Stack analysis: 2026-03-26*
