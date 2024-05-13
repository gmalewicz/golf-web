import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, MatDialogMock, getTestRound } from '@/_helpers/test.helper';
import { HttpService, AuthenticationService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { AddScorecardComponent } from './add-scorecard.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routing } from '@/app.routing';

describe('AddScorecardComponent', () => {

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
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),],
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        BaseChartDirective,
        BrowserAnimationsModule,
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

  it('should click cancel button with valid form', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-cancel'));
    buttonElement.triggerEventHandler('click', null);
    expect(component.f.teeTime.value).toMatch('');

  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
