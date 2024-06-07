import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddTeeComponent } from './add-tee.component';
import { By } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CourseNavigationService } from '../_services/course-navigation.service';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MimicBackendCourseInterceptor } from '../_helpers/MimicBackendCourseInterceptor';
import { CourseHttpService } from '../_services/courseHttp.service';
import { getTestCourse } from '@/_helpers/test.helper';


describe('AddTeeComponent', () => {
  let component: AddTeeComponent;
  let fixture: ComponentFixture<AddTeeComponent>;

  const courseNavigationService: CourseNavigationService = new CourseNavigationService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AddTeeComponent,
        CommonModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        BrowserAnimationsModule],
    providers: [
        CourseHttpService,
        { provide: CourseNavigationService, useValue: courseNavigationService },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendCourseInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(AddTeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should addTee during adding the course', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-tee'));
    // Trigger click event after spyOn
    component.g.tee.setValue(0);
    component.g.cr.setValue(62.1);
    component.g.sr.setValue(123);
    component.g.teeTypeDropDown.setValue(1);
    component.g.sexDropDown.setValue(true);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(courseNavigationService.tees().length).toBe(1);

  }));

  it('should addTee to the existing course', fakeAsync(() => {

    courseNavigationService.addTee.set(true);
    courseNavigationService.course.set(getTestCourse());
    courseNavigationService.tees.set([]);

    const radioElement = fixture.debugElement.query(By.css('.btn-tee'));
    // Trigger click event after spyOn
    component.g.tee.setValue(0);
    component.g.cr.setValue(62.1);
    component.g.sr.setValue(123);
    component.g.teeTypeDropDown.setValue(1);
    component.g.sexDropDown.setValue(true);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(courseNavigationService.tees().length).toBe(1);

  }));

  it('should addTee but such tee already exists', fakeAsync(() => {


    courseNavigationService.tees.set([{tee: 'yellow', cr: 62.1, sr: 123, teeType: 1, sex: true}]);

    const radioElement = fixture.debugElement.query(By.css('.btn-tee'));
    // Trigger click event after spyOn
    component.g.tee.setValue('yellow');
    component.g.cr.setValue(62.1);
    component.g.sr.setValue(123);
    component.g.teeTypeDropDown.setValue(1);
    component.g.sexDropDown.setValue(true);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(courseNavigationService.tees().length).toBe(1);

  }));



  it('should addTee but not all data set', fakeAsync(() => {

    const radioElement = fixture.debugElement.query(By.css('.btn-tee'));
    // Trigger click event after spyOn
    component.g.tee.setValue(0);
    component.g.cr.setValue(62.1);
    // component.g.sr.setValue(123);
    component.g.teeTypeDropDown.setValue(1);
    component.g.sexDropDown.setValue(true);

    radioElement.triggerEventHandler('click',  null);
    tick();
    expect(courseNavigationService.tees()).toBeUndefined();

  }));

  afterEach(() => {
    courseNavigationService.tees.set(undefined);
  });

});
