import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeagueComponent } from './league.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { MatDialogModule } from '@angular/material/dialog';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';

describe('LeagueComponent', () => {
  let component: LeagueComponent;
  let fixture: ComponentFixture<LeagueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeagueComponent],
      imports: [
        HttpClientModule,
        MatDialogModule,
      ],
      providers: [
        LeagueHttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true }
      ]
    });
    fixture = TestBed.createComponent(LeagueComponent);
    component = fixture.componentInstance;
    component.navigationService.league.set({id: 1, name: 'test league', status: true, player: {id: 1}});
    component.navigationService.players.set([]);
    component.navigationService.matches.set([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
