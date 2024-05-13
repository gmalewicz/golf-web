import { ListCoursesComponent } from './../list-courses/list-courses.component';
import { routing } from '@/app.routing';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CoursesComponent } from './courses.component';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';


describe('CoursesComponent', () => {

  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [
        ReactiveFormsModule,
        FontAwesomeModule,
        CoursesComponent, ListCoursesComponent,
    ],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules))]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
    history.pushState({data: {parent: 'courses'}}, '');
    TestBed.inject(AuthenticationService);
    fixture.detectChanges();
  });

  it('should create for courses', () => {
    expect(component).toBeTruthy();
  });

  it('should click Search tab', fakeAsync(() => {

    const tabElement = fixture.debugElement.query(By.css('#search-tab'));
    tabElement.triggerEventHandler('click', '');
    tick();
    fixture.detectChanges();
    expect(component.selectedTab).toBe(1);
  }));

  it('should key up with less than 2 letters', fakeAsync(() => {

    component.f.courseName.setValue('li');
    component.onKey();
    expect(component.courses.searchRes).toBeUndefined();
  }));

  it('should key up with more than 2 letters', fakeAsync(() => {

    component.f.courseName.setValue('lis');
    component.onKey();
    expect(component.courses.searchRes.length).toBe(1);
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
