import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MoveCourseComponent } from './move-course.component';

describe('MoveCourseComponent', () => {
  let component: MoveCourseComponent;
  let fixture: ComponentFixture<MoveCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveCourseComponent ],
      imports: [
        ReactiveFormsModule,
        routing,
        HttpClientModule
      ],
      providers: [HttpService,
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  { provide: AuthenticationService, useValue: authenticationServiceStub }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should move course to history', fakeAsync(() => {

    component.fMove.courseId.setValue('1');
    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.fMove.courseId.value).toMatch('1');
  }));

  it('should failed as course id is not provided', fakeAsync(() => {

    const btnElement = fixture.debugElement.query(By.css('.btn-success'));
    btnElement.nativeElement.click();
    tick();
    expect(component.fMove.courseId.hasError).toBeTruthy();
  }));
});


