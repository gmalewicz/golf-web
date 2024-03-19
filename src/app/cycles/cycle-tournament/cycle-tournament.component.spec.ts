import { routing } from '@/app.routing';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleTournamentComponent } from './cycle-tournament.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';

describe('CycleTournamentComponent', () => {
  let component: CycleTournamentComponent;
  let fixture: ComponentFixture<CycleTournamentComponent>;
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        CycleTournamentComponent,
    ],
    providers: [HttpService,
                AuthenticationService,
                provideHttpClient(withInterceptorsFromDi()),
                provideRouter(routing, withPreloading(PreloadAllModules))
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CycleTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create but player does not exists', () => {
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(CycleTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
