import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametersComponent } from './parameters.component';
import { TournamentNavigationService } from '@/tournament/_services/tournamentNavigation.service';
import { TeeTimePublishStatus } from '@/tournament/_models/teeTimeParameters';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

describe('ParametersComponent', () => {
  let component: ParametersComponent;
  let fixture: ComponentFixture<ParametersComponent>;
  const tournamentNavigationService: TournamentNavigationService = new TournamentNavigationService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametersComponent,
                ReactiveFormsModule,
                MatSelectModule,
                MatInputModule,
                CommonModule,
                BrowserAnimationsModule],
      providers: [
        { provide: TournamentNavigationService, useValue: tournamentNavigationService},
      ]
    })
    .compileComponents();
    tournamentNavigationService.teeTimeParameters.set({firstTeeTime: "09:00", teeTimeStep: 10, flightSize: 4, published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED});
    fixture = TestBed.createComponent(ParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change form value', () => {
    component.f.flightSize.setValue(2);
    expect(component).toBeTruthy();
  });

  it('should update parameters', () => {
    component.updateParameters();
    expect(component).toBeTruthy();
  });


});
