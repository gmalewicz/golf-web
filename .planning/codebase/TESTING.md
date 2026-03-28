# Testing Patterns

**Analysis Date:** 2026-03-26

## Test Framework

**Runner:**
- Karma 6.4.x + Jasmine 6.1.x
- Config: `karma.conf.js`
- Browser: ChromeHeadlessNoSandbox (Chrome headless with `--no-sandbox`)
- Reporter: `karma-spec-reporter` (concise output)
- Coverage: `karma-coverage` → lcov format → `coverage/lcov-report/`

**Assertion Library:**
- Jasmine built-in (`expect`, `toEqual`, `toBe`, `toHaveBeenCalledWith`, etc.)

**Run Commands:**
```bash
ng test                    # Run all tests (watch mode)
ng test --watch=false      # Single run
ng test --code-coverage    # With coverage report
```

## Test File Organization

**Location:**
- Co-located with source: `<component>.component.spec.ts` next to `<component>.component.ts`
- Exceptions: interceptor specs in `src/app/_helpers/tests/` subdirectory

**Naming:**
- `<source-file>.spec.ts` — e.g., `rounds.component.spec.ts`, `authentication.service.spec.ts`
- E2E: `cypress/e2e/*.js` (login, mainPage, register)

**Structure:**
```
src/app/<feature>/
├── <component>.component.ts
├── <component>.component.spec.ts   ← co-located
├── _helpers/
│   └── tests/
│       └── <interceptor>.spec.ts   ← interceptor tests in subdirectory
└── _services/
    └── <service>.spec.ts           ← service tests co-located
```

## Test Structure

**Suite Organization:**
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;
  let someService: SomeService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        ComponentNameComponent,   // standalone component imported directly
      ],
      providers: [
        HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        AuthenticationService,
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // seed localStorage for auth state
    localStorage.setItem('currentPlayer', JSON.stringify([{ nick: 'test', id: 1 }]));
    fixture = TestBed.createComponent(ComponentNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should do something', fakeAsync(() => {
    // arrange
    // act
    flushMicrotasks();
    // assert
    expect(component.someProperty).toBe(expectedValue);
  }));

  afterEach(waitForAsync(() => {
    // cleanup (e.g., authenticationService.logout())
  }));
});
```

**Patterns:**
- Setup: `beforeEach(waitForAsync(() => { TestBed.configureTestingModule({...}) }))`
- Component init: separate `beforeEach()` block after `waitForAsync` block
- Async tests: use `fakeAsync` + `flushMicrotasks()` for microtask-based async
- Auth state seeding: `localStorage.setItem('currentPlayer', JSON.stringify(...))` in `beforeEach`
- Cleanup: `afterEach(waitForAsync(...))` for logout/reset

## Mocking

**Framework:** Custom `MimicBackend*Interceptor` classes — Angular `HttpInterceptor` implementations

**Pattern:**
```typescript
// In TestBed providers:
{ provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true }

// MimicBackend interceptor returns hardcoded responses:
export class MimicBackendAppInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<...> {
    if (req.url.endsWith('rest/Holes/1') && req.method === 'GET') {
      return new Observable(observer => {
        observer.next(new HttpResponse<Array<unknown>>({ body: [...], status: 200 }));
        observer.complete();
      });
    }
    // ... more URL patterns
  }
}
```

**Available Mock Interceptors:**
- `src/app/_helpers/MimicBackendAppInterceptor.ts` — Global app endpoints (holes, tees, players, rounds, scores)
- `src/app/course/_helpers/MimicBackendCourseInterceptor.ts` — Course-specific endpoints
- `src/app/scorecard/_helpers/MimicBackendScoreInterceptor.ts` — Scorecard/online round endpoints
- `src/app/tournament/_helpers/MimicBackendTournamentInterceptor.ts` — Tournament endpoints
- `src/app/cycles/_helpers/MimicBackendCycleInterceptor.ts` — Cycle endpoints
- `src/app/mp-league/_helpers/MimicBackendMpLeaguesInterceptor.ts` — Match play league endpoints

**What to Mock:**
- All HTTP calls via `MimicBackend*Interceptor` (replace real HttpClient responses)
- Angular Material dialog via `MatDialogModule` import (real module, not mocked)
- Router via `provideRouter(routing, ...)` (real router)

**What NOT to Mock:**
- Angular forms, router, Material modules — use real implementations
- Auth service — use real `AuthenticationService` seeded via `localStorage`

## Fixtures and Test Data

**Test Data:**
```typescript
// Global test helper: src/app/_helpers/test.helper.ts
export function getTestRound(): Round {
  return {
    course: { id: 1, name: 'Lisia Polana', par: 72, holes: [...18 holes...] },
    roundDate: '10/10/2020',
    format: Format.STROKE_PLAY,
    mpFormat: 0.75,
    id: 1,
    player: [
      { id: 1, nick: 'test', roundDetails: { whs: 10, cr: 68, sr: 133, teeId: 0, teeType: teeTypes.TEE_TYPE_18 } },
      // ... more players
    ],
    scoreCard: [/* ...18 hole score entries */],
  };
}
```

**Location:**
- Global: `src/app/_helpers/test.helper.ts`
- Scorecard-specific: `src/app/scorecard/_helpers/test.helper.ts`
- Tournament-specific: `src/app/tournament/_helpers/test.helper.ts`
- Auth state: seeded inline via `localStorage.setItem('currentPlayer', JSON.stringify(...))`

## Coverage

**Requirements:** No minimum threshold enforced (no `thresholds` in `karma.conf.js`)

**View Coverage:**
```bash
ng test --watch=false --code-coverage
# Output: coverage/lcov-report/lcov.info (lcov format)
```

**SonarCloud:**
- Coverage reported to SonarCloud via `sonar-project.properties`

## Test Types

**Unit Tests:**
- Scope: Individual components, services, interceptors
- Approach: `TestBed.configureTestingModule` with `MimicBackend*Interceptor` for HTTP; real Angular modules
- Coverage: All feature components have `.spec.ts` files; business logic helpers covered

**Integration Tests:**
- Scope: Components with real child components and routing
- Approach: Import feature components + `provideRouter(routing)` + real HTTP mocking
- Example: `admin.component.spec.ts` includes real router and real `AuthenticationService`

**E2E Tests:**
- Framework: Cypress 15.7.x
- Location: `cypress/e2e/`
- Covered flows: Login (`login.js`), main page (`mainPage.js`), registration (`register.js`)

## Common Patterns

**Async Testing:**
```typescript
it('should load data', fakeAsync(() => {
  fixture.detectChanges();
  flushMicrotasks();
  expect(component.data).toBeDefined();
}));

// For waitForAsync:
it('should complete', waitForAsync(() => {
  fixture.detectChanges();
  fixture.whenStable().then(() => {
    expect(component.value).toBe(expected);
  });
}));
```

**Service Testing:**
```typescript
describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpService,
        AuthenticationService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
      ]
    });
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.loginSocial({ nick: 'test', id: 1, password: 'test', whs: 10.2, role: 0 });
  }));

  it('should get role', () => {
    expect(authenticationService.playerRole).toBe('ROLE_ADMIN,ROLE_PLAYER');
  });
});
```

---

*Testing analysis: 2026-03-26*
