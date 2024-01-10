import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { AlertService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';
import { AddCourseComponent } from './add-course.component';
import { Router } from '@angular/router';
import { alertServiceStub, MyRouterStub } from '@/_helpers/test.helper';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { teeTypes } from '@/_models/tee';

describe('AddCourseComponent', () => {
  let component: AddCourseComponent;
  let fixture: ComponentFixture<AddCourseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCourseComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        NgChartsModule,
        MatSelectModule,
        BrowserAnimationsModule,
        MatInputModule,
        routing,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.removeItem('currentPlayer');
    fixture = TestBed.createComponent(AddCourseComponent);
    component = fixture.componentInstance;
    spyOnProperty(component.authenticationService , 'currentPlayerValue').and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should click Clear button', fakeAsync(() => {

    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));
    spyOn(component, 'clear');
    // Trigger click event after spyOn
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.clear).toHaveBeenCalled();

  }));

  it('should test clear() function', fakeAsync(() => {

    component.f.courseName.setValue('test');
    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.f.courseName.value).toMatch('');

  }));

  it('should test selectHole() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.input-hole'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click', {});
    tick();
    expect(component.updatingHole).toBe(0);

  }));

  it('should test selectPar() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.input-par'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.pars[component.updatingHole]).toBe(3);

  }));

  it('should test selectSi() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.input-si'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.si[component.updatingHole]).toBe(1);

  }));

  it('should test addTee() function', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-tee'));
    // Trigger click event after spyOn
    component.g.tee.setValue(0);
    component.g.cr.setValue(62.1);
    component.g.sr.setValue(123);
    component.g.teeTypeDropDown.setValue(1);
    component.g.sexDropDown.setValue(true);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.tees.length).toBe(1);

  }));

  it('should test onSubmit() function not all pars set', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.pars.includes(0)).toBeTruthy();

  }));

  it('should test onSubmit() function not all si set', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.pars.fill(3);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.si.includes(0)).toBeTruthy();

  }));

  it('should test onSubmit() function no tee set', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.pars.fill(3);
    component.si.fill(5);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.tees.length).toBe(0);

  }));

  it('should test onSubmit() function with correct result', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.pars.fill(3);
    component.si.fill(5);
    component.tees = [{cr: 61.1, sr: 132, tee: 'yellow', teeType: teeTypes.TEE_TYPE_18, sex: false}];

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.tees.length).toBe(1);

  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
