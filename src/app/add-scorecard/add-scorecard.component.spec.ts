import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, MatDialogMock, getTestRound } from '@/_helpers/test.helper';
import { HttpService, AuthenticationService, AlertService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { AddScorecardComponent } from './add-scorecard.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routing } from '@/app.routing';
import { TournamentHttpService } from '@/tournament/_services/tournamentHttp.service';
import { of } from 'rxjs';

describe('AddScorecardComponent', () => {

  const routeStub = {
    snapshot: {
      queryParams: {
      }
    }
  };

  let component: AddScorecardComponent;
  let fixture: ComponentFixture<AddScorecardComponent>;
  let route: ActivatedRoute;

  beforeEach(async () => {

    TestBed.configureTestingModule({
    providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: MatDialog, useClass: MatDialogMock },
        provideCharts(withDefaultRegisterables()),
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        { provide: ActivatedRoute, useValue: routeStub },
        provideRouter(routing, withPreloading(PreloadAllModules)),],
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        BaseChartDirective,
        MatSelectModule,
        MatInputModule,
        AddScorecardComponent,
    ],
})
    .compileComponents();

    route = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(AddScorecardComponent);

    component = fixture.componentInstance;
    history.pushState({data: {}}, '');
    TestBed.inject(AuthenticationService);
    route.snapshot.params.courseId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
  });

  it('should click Clear button', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));

    component.f.teeTime.setValue('10:00');
    buttonElement.triggerEventHandler('click', null);
    expect(component.f.teeTime.value).toMatch('');

  }));

  it('should click hole', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.radio-hole'));

    buttonElement.triggerEventHandler('click', null);
    expect(component.updatingHole).toBe(1);

  }));

  it('should click put', () => {

    const buttonElement = fixture.debugElement.query(By.css('.radio-put'));

    buttonElement.triggerEventHandler('click', null);
    expect(component.putts[0]).toBe(0);

  });

  it('should click stroke', () => {

    component.updatingHole = 1;
    component.tee = {id: 4, teeType: 0};
    const buttonElement = fixture.debugElement.query(By.css('.radio-stroke'));

    buttonElement.triggerEventHandler('click', null);
    expect(component.strokes[0]).toBe(1);

  });

  it('should tee change', fakeAsync(() => {
    component.tee = {id: 4, teeType: 0};
    component.f.teeDropDown.setValue(4);
    component.teeChange(true);
    expect(component.tee.id).toBe(4);
  }));

  it('should click save button with invalid form', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);
    expect(component.f.teeTime.value).toMatch('');

  }));

  it('should click save button with valid form', fakeAsync(() => {

    component.f.teeDropDown.setValue(4);
    component.f.date.setValue('2020/10/10');
    component.f.teeTime.setValue('10:00');
    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);
    expect(component.f.teeTime.value).toMatch('10:00');

  }));

  it('should click save button with valid form and round', fakeAsync(() => {

    component.round = getTestRound();

    component.f.teeDropDown.setValue(4);
    component.f.date.setValue('2020/10/10');
    component.f.teeTime.setValue('10:00');
    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);
    expect(component.round).toBeDefined();

  }));

  it('should save with changed tee in edit mode', fakeAsync(() => {

    component.round = getTestRound();

    // change tee to a different value
    component.f.teeDropDown.setValue(5);
    component.f.date.setValue('2020/10/10');
    component.f.teeTime.setValue('10:00');
    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);
    expect(component.f.teeDropDown.value).toBe(5);

  }));

  it('should save without calling updateRoundTee when tee unchanged in edit mode', fakeAsync(() => {

    component.round = getTestRound();

    // same tee selected as original
    component.f.teeDropDown.setValue(4);
    component.f.date.setValue('2020/10/10');
    component.f.teeTime.setValue('10:00');
    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);
    expect(component.f.teeDropDown.value).toBe(4);

  }));

  it('should click cancel button with valid form', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-cancel'));
    buttonElement.triggerEventHandler('click', null);
    expect(component.f.teeTime.value).toMatch('');

  }));

  it('should initialize with tournament edit context', () => {

    const tournamentEdit = { tournamentResultId: 1, tournamentId: 2, playerId: 3, playerSex: false };
    history.pushState({data: {tournamentEdit}}, '');
    const newFixture = TestBed.createComponent(AddScorecardComponent);
    const newComponent = newFixture.componentInstance;
    route.snapshot.params.courseId = 1;
    newFixture.detectChanges();

    expect(newComponent.tournamentEdit).toEqual(tournamentEdit);

  });

  it('should save with tournament edit mode', fakeAsync(() => {

    const tournamentHttpService = TestBed.inject(TournamentHttpService);
    spyOn(tournamentHttpService, 'deleteRound').and.returnValue(of(undefined));
    spyOn(tournamentHttpService, 'addRoundToTournament').and.returnValue(of(undefined));

    component.round = getTestRound();
    component.tournamentEdit = { tournamentResultId: 5, tournamentId: 2, playerId: 3, playerSex: false };

    component.f.teeDropDown.setValue(4);
    component.f.date.setValue('2020/10/10');
    component.f.teeTime.setValue('10:00');
    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);

    expect(tournamentHttpService.deleteRound).toHaveBeenCalledWith(5, 1);
    expect(tournamentHttpService.addRoundToTournament).toHaveBeenCalled();
    expect(component.display).toBeFalse();

  }));

  it('should disable holes 10 to 18 when teeType is 1', fakeAsync(() => {

    component.course.tees!.push({id: 5, tee: 'front 9', cr: 33.0, sr: 120, teeType: 1});
    component.f.teeDropDown.setValue(5);
    component.teeChange(false);

    expect(component.holeSelectorActive[0].disabled).toBeFalse();
    expect(component.holeSelectorActive[9].disabled).toBeTrue();

  }));

  it('should disable holes 1 to 9 when teeType is 2', fakeAsync(() => {

    component.course.tees!.push({id: 6, tee: 'back 9', cr: 33.0, sr: 120, teeType: 2});
    component.f.teeDropDown.setValue(6);
    component.teeChange(false);

    expect(component.holeSelectorActive[0].disabled).toBeTrue();
    expect(component.holeSelectorActive[9].disabled).toBeFalse();

  }));

  it('should show error when selected stroke is lower than current putts', () => {

    const alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');

    component.updatingHole = 1;
    component.putts[0] = 3;
    component.tee = {id: 4, teeType: 0};

    component.selectStroke(2);

    expect(alertService.error).toHaveBeenCalled();
    expect(component.strokes[0]).toBe(0);

  });

  it('should show error when selected putts exceed current strokes', () => {

    const alertService = TestBed.inject(AlertService);
    spyOn(alertService, 'error');

    component.updatingHole = 1;
    component.strokes[0] = 1;

    component.selectPat(2);

    expect(alertService.error).toHaveBeenCalled();
    expect(component.putts[0]).toBe(0);

  });

  it('should highlight stroke selector when selecting hole with existing score', () => {

    component.strokes[2] = 5;

    component.selectHole(3);

    expect(component.updatingHole).toBe(3);
    expect(component.strokeSelectorActive[4].active).toBeTrue();

  });

  it('should highlight put selector when selecting hole with existing putts', () => {

    component.strokes[0] = 4;
    component.putts[0] = 2;

    component.selectHole(1);

    expect(component.patSelectorActive[2].active).toBeTrue();

  });

  it('should calculate displayResult correctly for teeType 0', fakeAsync(() => {

    component.course.par = 72;
    component.strokes.fill(4);
    component.course.tees = [{id: 4, teeType: 0, tee: 'men red', cr: 66.9, sr: 125}];
    component.f.teeDropDown.setValue(4);

    component.teeChange(false);

    expect(component.displayResult).toBe('72/72 (0)');

  }));

  it('should calculate displayResult correctly for teeType 1', fakeAsync(() => {

    // first9Par is 36 from mock holes (set during detectChanges)
    for (let i = 0; i < 9; i++) { component.strokes[i] = 4; }
    component.course.tees!.push({id: 7, teeType: 1, tee: 'front 9', cr: 33.0, sr: 120});
    component.f.teeDropDown.setValue(7);

    component.teeChange(false);

    expect(component.displayResult).toBe('36/36 (0)');

  }));

  it('should calculate displayResult correctly for teeType 2', fakeAsync(() => {

    component.course.par = 72;
    // first9Par is 36 from mock holes (set during detectChanges)
    for (let i = 9; i < 18; i++) { component.strokes[i] = 4; }
    component.course.tees!.push({id: 8, teeType: 2, tee: 'back 9', cr: 33.0, sr: 120});
    component.f.teeDropDown.setValue(8);

    component.teeChange(false);

    expect(component.displayResult).toBe('36/36 (0)');

  }));

  it('should clear strokes and putts after clear is confirmed', fakeAsync(() => {

    component.strokes.fill(5);
    component.putts.fill(2);

    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));
    buttonElement.triggerEventHandler('click', null);

    expect(component.strokes.every(s => s === 0)).toBeTrue();
    expect(component.putts.every(p => p === 0)).toBeTrue();
    expect(component.displayResult).toBe('');

  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
