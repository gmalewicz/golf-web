import { Course } from '@/_models/course';
import { Tee } from '@/_models/tee';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CourseNavigationService {

  public tees = signal<Tee[]>([]);
  public removeTee = signal<boolean>(undefined);
  public cloneCourse = signal<Course>(undefined);
  public addTee = signal<boolean>(undefined);
  public course = signal<Course>(undefined);

  init() {
    this.tees.set([]);
    this.removeTee.set(undefined);
    this.addTee.set(false);
    this.course.set(undefined);
  }
}


