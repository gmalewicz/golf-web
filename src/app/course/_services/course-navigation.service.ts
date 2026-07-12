import { Course } from '@/_models/course';
import { Tee } from '@/_models/tee';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CourseNavigationService {

  tees = signal<Tee[]>([]);
  removeTee = signal<boolean | undefined>(undefined);
  cloneCourse = signal<Course | undefined>(undefined);
  addTee = signal<boolean | undefined>(undefined);
  course = signal<Course | undefined>(undefined);

  init() {
    this.tees.set([]);
    this.removeTee.set(undefined);
    this.addTee.set(false);
    this.course.set(undefined);
  }
}


