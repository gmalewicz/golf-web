import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AddCourseComponent } from './add-course.component';
import { Router } from '@angular/router';
import { alertServiceStub, authenticationServiceStub, getTestCourse, MyRouterStub } from '@/_helpers/test.helper';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { teeTypes } from '@/_models/tee';
import { CourseNavigationService } from '../_services/course-navigation.service';
import { BaseChartDirective } from 'ng2-charts';

describe('AddCourseComponent', () => {
  let component: AddCourseComponent;
  let fixture: ComponentFixture<AddCourseComponent>;
  const courseNavigationService: CourseNavigationService = new CourseNavigationService();

  const standardSetup = () => {
    fixture = TestBed.createComponent(AddCourseComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddCourseComponent,
        HttpClientModule,
        ReactiveFormsModule,
        BaseChartDirective,
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
        { provide: AlertService, useValue: alertServiceStub },
        { provide: CourseNavigationService, useValue: courseNavigationService},
        { provide: AuthenticationService, useValue: authenticationServiceStub }]
    })
    .compileComponents();
  }));

  it('should create but player is not defined', () => {
    spyOnProperty(authenticationServiceStub , 'currentPlayerValue', 'get').and.returnValue(null);
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should click Clear button', fakeAsync(() => {
    standardSetup();
    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));
    spyOn(component, 'clear');
    // Trigger click event after spyOn
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.clear).toHaveBeenCalled();

  }));

  it('should test clear() function', fakeAsync(() => {
    standardSetup();
    component.f.courseName.setValue('test');
    const buttonElement = fixture.debugElement.query(By.css('.btn-clear'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.f.courseName.value).toMatch('');

  }));

  it('should test selectHole() function', fakeAsync(() => {
    standardSetup();
    component.pars[0] = 5;
    component.si[0] = 5;
    const radioElement = fixture.debugElement.query(By.css('.input-hole'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click', {});
    tick();
    expect(component.updatingHole).toBe(0);

  }));

  it('should test selectPar() function', fakeAsync(() => {
    standardSetup();
    const radioElement = fixture.debugElement.query(By.css('.input-par'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.pars[component.updatingHole]).toBe(3);

  }));

  it('should test selectSi() function', fakeAsync(() => {
    standardSetup();
    const radioElement = fixture.debugElement.query(By.css('.input-si'));
    // Trigger click event after spyOn
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.si[component.updatingHole]).toBe(1);

  }));

  it('should test selectSi() function but the same SI has been set', fakeAsync(() => {
    standardSetup();
    const radioElement = fixture.debugElement.query(By.css('.input-si'));
    // Trigger click event after spyOn
    component.si[5] = 1;
    radioElement.triggerEventHandler('click',  {});
    tick();
    expect(component.si[component.updatingHole]).toBe(0);

  }));

  it('should test onSubmit() function not all pars set', fakeAsync(() => {
    standardSetup();
    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.f.nbrHolesDropDown.setValue(18);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.pars.includes(0)).toBeTruthy();

  }));

  it('should test onSubmit() function not all si set', fakeAsync(() => {
    standardSetup();
    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.f.nbrHolesDropDown.setValue(18);
    component.pars.fill(3);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(component.si.includes(0)).toBeTruthy();

  }));

  it('should test onSubmit() function no tee set', fakeAsync(() => {
    standardSetup();
    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.f.nbrHolesDropDown.setValue(18);
    component.pars.fill(3);
    component.si.fill(5);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(courseNavigationService.tees().length).toBe(0);

  }));

  it('should test onSubmit() function with correct result', fakeAsync(() => {
    standardSetup();
    const radioElement = fixture.debugElement.query(By.css('.btn-submit'));
    // Trigger click event after spyOn
    component.f.courseName.setValue('test');
    component.f.coursePar.setValue(72);
    component.f.nbrHolesDropDown.setValue(18);
    component.pars.fill(3);
    component.si.fill(5);
    courseNavigationService.tees.set([{cr: 61.1, sr: 132, tee: 'yellow', teeType: teeTypes.TEE_TYPE_18, sex: false}]);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(courseNavigationService.tees().length).toBe(1);

  }));

  it('should process clone course', fakeAsync(() => {
    courseNavigationService.cloneCourse.set(getTestCourse());
    standardSetup();
    expect(component).toBeTruthy();

  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
