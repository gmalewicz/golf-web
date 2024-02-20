import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeeTimeComponent } from './tee-time.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ParametersComponent } from '../parameters/parameters.component';
import { PreviewComponent } from '../preview/preview.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { TournamentNavigationService } from '@/tournament/_services/tournamentNavigation.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TeeTimeComponent', () => {
  let component: TeeTimeComponent;
  let fixture: ComponentFixture<TeeTimeComponent>;
  const tournamentNavigationService: TournamentNavigationService = new TournamentNavigationService();

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
                  { provide: AuthenticationService, useValue: authenticationServiceStub }]
    })
    .compileComponents();

    tournamentNavigationService.teeTimesChecked.set(true);
    tournamentNavigationService.tournament.set({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, player: {id: 1}});
    fixture = TestBed.createComponent(TeeTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
