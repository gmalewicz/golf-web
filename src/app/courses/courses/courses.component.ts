import { Component, OnInit} from '@angular/core';
import { Course } from '@/_models/course';
import { Router } from '@angular/router';
import { AuthenticationService } from '@/_services/authentication.service';
import { Courses } from '@/_models/courses';
import { AlertService } from '@/_services/alert.service';
import { FormBuilder, FormGroup} from '@angular/forms';
import { HttpService } from '@/_services';
import { tap } from 'rxjs/operators';
import { Tournament } from '@/tournament/_models/tournament';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html'
})
export class CoursesComponent implements OnInit {

  favouriteCourses: Array<Course>;

  // parent data who call me
  data: {parent: string, tournament?: Tournament};
  selectedTab: number;

  courses: Courses;

  loading: boolean;

  public searchCourseForm: FormGroup;

  constructor(public authenticationService: AuthenticationService,
              private router: Router,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private httpService: HttpService) {
  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {
      this.data = history.state.data;
      this.selectedTab = 0;
      this.courses = {};
      this.loading = false;

      this.searchCourseForm = this.formBuilder.group({
        courseName: ['']
      });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.searchCourseForm.controls; }

  onTabClick(id: number) {
    this.alertService.clear();
    this.selectedTab = id;
    // initialize search result

    if (id === 1 && this.courses.searchRes === undefined) {
      this.loading = true;
      this.httpService.getSortedCourses(0).pipe(
        tap(
          courses => {
            this.loading = false;
            this.courses.searchRes = courses;
          })
      ).subscribe();
    }
  }

  onKey() {

    // only if at least 3 letters have been provided
    if (this.searchCourseForm.invalid || this.f.courseName.value.length < 3) {
      return;
    }
    this.loading = true;
    this.httpService.searchForCourse(this.f.courseName.value).pipe(
      tap(
        courses => {
          this.loading = false;
          this.courses.searchRes = courses;
        })
    ).subscribe();
}
}
