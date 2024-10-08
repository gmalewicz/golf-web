
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { Course } from '@/_models/course';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ListCoursesComponent } from './list-courses.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { ComponentRef } from '@angular/core';

describe('ListCoursesComponent', () => {
  let component: ListCoursesComponent;
  let fixture: ComponentFixture<ListCoursesComponent>;
  let componentRef: ComponentRef<ListCoursesComponent>;

  const course: Course = {id: 1, name: 'Lisia Polana', par: 72, holeNbr: 18};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        FontAwesomeModule,
        ListCoursesComponent,
    ],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideRouter(routing, withPreloading(PreloadAllModules))]
})
    .compileComponents();
  });

  it('should delete from favourites', fakeAsync(() => {

    fixture = TestBed.createComponent(ListCoursesComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef

    componentRef.setInput('data', {parent: 'courses'});
    componentRef.setInput('courses', {favourites: [course]});
    componentRef.setInput('selectedTab', 0);

    fixture.detectChanges();

    component.onClickFavourite(course);

    expect(component.courses().favourites.length).toBe(0);
  }));

  it('should add to favourites', fakeAsync(() => {

    fixture = TestBed.createComponent(ListCoursesComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef

    componentRef.setInput('data', {parent: 'courses'});
    componentRef.setInput('courses', {favourites: [course]});
    componentRef.setInput('selectedTab', 1);

    fixture.detectChanges();

    component.onClickFavourite({id: 2, name: 'Lisia Polana', par: 72, holeNbr: 18});

    expect(component.courses().favourites.length).toBe(2);
  }));

  it('should search for all courses', fakeAsync(() => {

    fixture = TestBed.createComponent(ListCoursesComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef

    componentRef.setInput('data', {parent: 'courses'});
    componentRef.setInput('courses', {favourites: [course]});
    componentRef.setInput('selectedTab', 2);

    fixture.detectChanges();

    expect(component.courses().all.length).toBe(1);
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

});
