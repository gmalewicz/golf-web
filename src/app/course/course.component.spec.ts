import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { alertServiceStub, getTestCourse, MyRouterStub } from '@/_helpers/test.helper';
import { AlertService, HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';

import { CourseComponent } from './course.component';

describe('CourseComponent', () => {
  let component: CourseComponent;
  let fixture: ComponentFixture<CourseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseComponent ],
      imports: [
        HttpClientModule,
        routing,
        NgChartsModule,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseComponent);
    history.pushState({data: {course: getTestCourse()}}, '');
    component = fixture.componentInstance;
    spyOnProperty(component.authenticationService , 'currentPlayerValue').and.returnValue({nick: 'test', id: 1});
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should press showTees', fakeAsync(() => {
    const buttonElement = fixture.debugElement.query(By.css('.btn-showTees'));
    buttonElement.triggerEventHandler('click', null);
    tick();
    expect(component.displayTees).toBeTruthy();
  }));

  it('should delete course', fakeAsync(() => {
    component.delete();
    expect(component).toBeTruthy();
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
