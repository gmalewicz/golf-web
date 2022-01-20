import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, MatDialogMock, getTestRound } from '@/_helpers/test.helper';
import { HttpService, AuthenticationService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgChartsModule } from 'ng2-charts';
import { DropdownModule } from 'primeng/dropdown';
import { AddScorecardComponent } from './add-scorecard.component';

describe('AddScorecardComponent', () => {

  let component: AddScorecardComponent;
  let fixture: ComponentFixture<AddScorecardComponent>;
  let route: ActivatedRoute;

  beforeEach(waitForAsync(() => {

    TestBed.configureTestingModule({
      declarations: [ AddScorecardComponent ],
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  { provide: MatDialog, useClass: MatDialogMock}],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        routing,
        MatDialogModule,
        DropdownModule,
        NgChartsModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([])
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
  }));

  it('should create', () => {

    expect(component).toBeTruthy();
  });

  it('should click Clear button', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));

    component.f.teeTime.setValue('10:00');
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.f.teeTime.value).toMatch('');

  }));

  it('should click hole', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.radio-hole'));

    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.updatingHole).toBe(1);

  }));

  it('should click put', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.radio-put'));

    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.putts[0]).toBe(0);

  }));

  it('should click stroke', fakeAsync(() => {

    component.updatingHole = 1;
    component.tee = {id: 4, teeType: 0};
    const buttonElement = fixture.debugElement.query(By.css('.radio-stroke'));

    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.strokes[0]).toBe(1);

  }));

  it('should tee change', fakeAsync(() => {
    component.tee = {id: 4, teeType: 0};
    component.f.teeDropDown.setValue(4);
    component.teeChange(true);
    expect(component.tee.id).toBe(4);
  }));

  it('should click save button with invalid form', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));

    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.f.teeTime.value).toMatch('');

  }));

  it('should click save button with valid form', fakeAsync(() => {

    component.f.teeDropDown.setValue(4);
    component.f.date.setValue('2020/10/10');
    component.f.teeTime.setValue('10:00');

    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.f.teeTime.value).toMatch('10:00');

  }));

  it('should click save button with valid form and round', fakeAsync(() => {

    component.round = getTestRound();

    component.f.teeDropDown.setValue(4);
    component.f.date.setValue('2020/10/10');
    component.f.teeTime.setValue('10:00');

    const buttonElement = fixture.debugElement.query(By.css('.btn-save'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.round).toBeDefined();

  }));

  it('should click cancel button with valid form', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-cancel'));

    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.f.teeTime.value).toMatch('');

  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
