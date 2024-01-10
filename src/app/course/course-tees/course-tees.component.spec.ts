import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseTeesComponent } from './course-tees.component';

describe('CourseTeesComponent', () => {
  let component: CourseTeesComponent;
  let fixture: ComponentFixture<CourseTeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseTeesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourseTeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
