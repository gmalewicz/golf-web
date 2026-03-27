# External Integrations

**Analysis Date:** 2026-03-26

## APIs & External Services

**Authentication (OAuth2 Social Login):**
- Facebook OAuth2 - Social login via Spring Boot OAuth2 backend
  - URL: `oauth2/authorization/facebook` (constructed as `environment.URL_STR + 'oauth2/authorization/facebook'`)
  - Triggered from: `src/app/login/login.component.ts`
- Google OAuth2 - Social login via Spring Boot OAuth2 backend
  - URL: `oauth2/authorization/google`
  - Triggered from: `src/app/login/login.component.ts`
- Social login completion handled in: `src/app/login/finish-social-dialog/finish-social-dialog.component.ts`

**reCAPTCHA:**
- Google reCAPTCHA v2 via `ng-recaptcha` 13.2.x
  - Used on: registration form (`src/app/registration/registration.component.ts`)
  - Player model has a `captcha` field passed to `rest/AddPlayer`

**Charts:**
- Chart.js 4.5.x via `ng2-charts` 10.0.x
  - Used in: cycle results and tournament results views
  - Configured in `src/main.ts` with `provideCharts(withDefaultRegisterables())`

## Data Storage

**Databases:**
- No direct database connection from frontend
- All data via backend REST API at `rest/*`
- Client: Angular `HttpClient` (`src/app/_services/http.service.ts`, domain-specific HTTP services)

**Session / Client Storage:**
- `localStorage` - Persists current player session
  - Key: `currentPlayer` (JSON-serialized `Player` object with JWT)
  - Managed by: `src/app/_services/authentication.service.ts`

**File Storage:**
- No file upload/storage integration detected

**Caching:**
- No server-side caching layer; navigation state cached in Angular signals (e.g., `RoundsNavigationService`)

## Authentication & Identity

**Auth Provider:**
- Custom JWT via Spring Boot backend
  - Login: `POST rest/Authenticate` with `{nick, password}`
  - JWT refresh: `GET rest/Refresh/{playerId}` (auto-triggered by `SessionRecoveryInterceptor`)
  - Social login token: passed as `?token=` query param on redirect back to Angular
  - Token stored in `localStorage` as part of the `Player` object

## Real-time Communication

**WebSocket (STOMP):**
- `@stomp/rx-stomp` 2.3.x over WebSocket for online scorecard live updates
  - Config: `src/app/scorecard/_helpers/golfRxStompConfig.ts`
  - Service: `src/app/scorecard/_services/rx-stomp.service.ts`
  - WebSocket endpoint resolved from `src/assets/app-config.json` (`wsEndpoint` field)
  - Supports `ws://` (HTTP) and `wss://` (HTTPS) automatically based on `document.location.protocol`
  - Reconnect delay: 200ms; heartbeat incoming: 4000ms

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, etc.)

**Logs:**
- `console.error` used only in `src/main.ts` bootstrap catch
- `console.log` used sparingly in navigation error handlers

## CI/CD & Deployment

**Hosting:**
- Firebase Hosting - project `valid-delight-259218` (`.firebaserc`)
- Apache HTTP Server - Docker-based deployment (`Dockerfile`, `httpd-ssl.conf`, `my-httpd.conf`)
- Dev Docker variant: `dev-Dockerfile`, `dev-httpd.conf`
- Kubernetes config: `config/deployment.yml`

**CI Pipeline:**
- SonarCloud code quality analysis (`sonar-project.properties`)
- No GitHub Actions / CircleCI config detected in workspace root

## Webhooks & Callbacks

**Incoming:**
- OAuth2 redirect callback: `/login?token=<jwt>` or `/login?error=<code>`

**Outgoing:**
- None detected

## Environment Configuration

**Required configurations:**
- `src/environments/environment.ts` → `URL_STR` (backend base URL)
- `src/assets/app-config.json` → `wsEndpoint` (WebSocket server host)

**Secrets location:**
- No `.env` file detected; configuration is embedded in Angular environment files and assets

---

*Integration audit: 2026-03-26*
