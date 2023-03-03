
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { Course } from '@/_models/course';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ListCoursesComponent } from './list-courses.component';

describe('ListCoursesComponent', () => {
  let component: ListCoursesComponent;
  let fixture: ComponentFixture<ListCoursesComponent>;

  const course: Course = {id: 1, name: 'Lisia Polana', par: 72, holeNbr: 18};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCoursesComponent ],
      imports: [
        HttpClientModule,
        FontAwesomeModule,
        routing,
      ],
      providers: [HttpService,
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  { provide: AuthenticationService, useValue: authenticationServiceStub }]
    })
    .compileComponents();
  });

  it('should delete from favourites', fakeAsync(() => {

    fixture = TestBed.createComponent(ListCoursesComponent);
    component = fixture.componentInstance;
    component.courses = {favourites: [course]};
    component.data = {parent: 'courses'};
    component.selectedTab = 0;

    fixture.detectChanges();

    component.onClickFavourite(course);

    expect(component.courses.favourites.length).toBe(0);
  }));

  it('should add to favourites', fakeAsync(() => {

    fixture = TestBed.createComponent(ListCoursesComponent);
    component = fixture.componentInstance;
    component.courses = {favourites: [course]};
    component.data = {parent: 'courses'};
    component.selectedTab = 0;

    fixture.detectChanges();

    component.selectedTab = 1;
    component.onClickFavourite({id: 2, name: 'Lisia Polana', par: 72, holeNbr: 18});

    expect(component.courses.favourites.length).toBe(2);
  }));

  it('should search for all courses', fakeAsync(() => {

    fixture = TestBed.createComponent(ListCoursesComponent);
    component = fixture.componentInstance;
    component.courses = {favourites: [course]};
    component.data = {parent: 'courses'};
    component.selectedTab = 2;

    fixture.detectChanges();

    expect(component.courses.all.length).toBe(1);
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
