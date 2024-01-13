import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AddTeeComponent } from './add-tee.component';
import { By } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CourseNavigationService } from '../_services/course-navigation.service';


describe('AddTeeComponent', () => {
  let component: AddTeeComponent;
  let fixture: ComponentFixture<AddTeeComponent>;

  const courseNavigationService: CourseNavigationService = new CourseNavigationService();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddTeeComponent,
        CommonModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: CourseNavigationService, useValue: courseNavigationService}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should addTee', fakeAsync(() => {

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
