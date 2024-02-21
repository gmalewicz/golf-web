import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeeTimeComponent } from './tee-time.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ParametersComponent } from '../parameters/parameters.component';
import { PreviewComponent } from '../preview/preview.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { TournamentNavigationService } from '@/tournament/_services/tournamentNavigation.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MimicBackendTournamentInterceptor } from '@/tournament/_helpers/MimicBackendTournamentInterceptor';

describe('TeeTimeComponent', () => {
  let component: TeeTimeComponent;
  let fixture: ComponentFixture<TeeTimeComponent>;
  const tournamentNavigationService: TournamentNavigationService = new TournamentNavigationService();

  const standardSetup = () => {
    tournamentNavigationService.teeTimesChecked.set(true);
    tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, player: {id: 1}});
    fixture = TestBed.createComponent(TeeTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeeTimeComponent,
                CommonModule,
                ReactiveFormsModule,
                MatTabsModule,
                ParametersComponent,
                PreviewComponent,
                HttpClientModule,
                BrowserAnimationsModule],
      providers: [
                  { provide: TournamentNavigationService, useValue: tournamentNavigationService},
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },]
    })
    .compileComponents();
  });

  it('should create', () => {
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should create but tee times not checked', () => {
    tournamentNavigationService.teeTimesChecked.set(false);
    tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, player: {id: 1}});
    fixture = TestBed.createComponent(TeeTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get players', () => {
    standardSetup();
    tournamentNavigationService.tournamentPlayers.set(undefined);
    component.getPlayers();
    expect(component).toBeTruthy();
  });

  it('should save tee times', () => {
    standardSetup();
    component.saveTeeTimes();
    expect(component).toBeTruthy();
  });

  it('should publish tee times', () => {
    standardSetup();
    component.publishTeeTimes();
    expect(component).toBeTruthy();
  });

  it('should delete tee times', () => {
    standardSetup();
    component.deleteTeeTimes();
    expect(component).toBeTruthy();
  });
});
