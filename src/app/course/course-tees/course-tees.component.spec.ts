import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseTeesComponent } from './course-tees.component';
import { getTee } from '@/_helpers/test.helper';
import { CourseNavigationService } from '../_services/course-navigation.service';

describe('CourseTeesComponent', () => {
  let component: CourseTeesComponent;
  let fixture: ComponentFixture<CourseTeesComponent>;
  const courseNavigationService: CourseNavigationService = new CourseNavigationService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseTeesComponent],
      providers: [
        { provide: CourseNavigationService, useValue: courseNavigationService},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseTeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete tee', () => {
    component.courseNavigationService.tees.set([getTee()]);
    component.deleteTee(getTee());
    expect(component).toBeTruthy();
  });
});
