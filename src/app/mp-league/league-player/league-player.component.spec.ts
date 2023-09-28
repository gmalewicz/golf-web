import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaguePlayerComponent } from './league-player.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { HttpService } from '@/_services/http.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('LeaguePlayerComponent', () => {
  let component: LeaguePlayerComponent;
  let fixture: ComponentFixture<LeaguePlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaguePlayerComponent,
                HttpClientModule,
                MatDialogModule,
      ],
      providers: [HttpService,
                  LeagueHttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub},
      ]
    });
    fixture = TestBed.createComponent(LeaguePlayerComponent);
    component = fixture.componentInstance;
    component.navigationService.league.set({id: 1, name: 'test league', status: true, player: {id: 1}});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
