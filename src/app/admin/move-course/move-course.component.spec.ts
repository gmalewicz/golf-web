import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCourseComponent } from './move-course.component';

describe('MoveCourseComponent', () => {
  let component: MoveCourseComponent;
  let fixture: ComponentFixture<MoveCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveCourseComponent ]
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
});
