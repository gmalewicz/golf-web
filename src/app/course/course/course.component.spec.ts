import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { alertServiceStub, authenticationServiceStub, getTestCourse, MyRouterStub } from '@/_helpers/test.helper';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, Router, withPreloading } from '@angular/router';
import { CourseComponent } from './course.component';
import { CourseTeesComponent } from '../course-tees/course-tees.component';
import { CommonModule } from '@angular/common';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('CourseComponent', () => {
  let component: CourseComponent;
  let fixture: ComponentFixture<CourseComponent>;

  const standardSetup = () => {
    fixture = TestBed.createComponent(CourseComponent);
    history.pushState({data: {course: getTestCourse()}}, '');

    fixture.detectChanges();
    component = fixture.componentInstance;
  };


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CourseComponent,
        BaseChartDirective,
        CourseTeesComponent,
        CommonModule,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules)),
        provideCharts(withDefaultRegisterables()),
      ]
    })
    .compileComponents();
  }));

  it('should create with player', () => {
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should create with admin', () => {
    spyOnProperty(authenticationServiceStub , 'playerRole').and.returnValue('ADMIN');
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should create but player is not defined', () => {
    spyOnProperty(authenticationServiceStub , 'currentPlayerValue', 'get').and.returnValue(null);
    fixture = TestBed.createComponent(CourseComponent);
    history.pushState({data: {course: getTestCourse()}}, '');

    fixture.detectChanges();
    component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });


  it('should press showTees', fakeAsync(() => {
    standardSetup();
    const buttonElement = fixture.debugElement.query(By.css('.btn-showTees'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.displayTees).toBeTruthy();
  }));

  it('should press hideTees', fakeAsync(() => {
    standardSetup();
    component.displayTees = true;
    const buttonElement = fixture.debugElement.query(By.css('.btn-showTees'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.displayTees).toBeFalsy();
  }));

  it('should delete course', fakeAsync(() => {
    standardSetup();
    component.delete();
    expect(component).toBeTruthy();
  }));

  it('should clone course', fakeAsync(() => {
    standardSetup();
    component.clone();
    expect(component).toBeTruthy();
  }));

  it('should addTee', fakeAsync(() => {
    standardSetup();
    component.addTee();
    expect(component).toBeTruthy();
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
