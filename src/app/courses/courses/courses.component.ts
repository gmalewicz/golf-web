import { Component, OnInit} from '@angular/core';
import { Course } from '@/_models/course';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '@/_services/authentication.service';
import { Courses } from '@/_models/courses';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '@/_services';
import { tap } from 'rxjs/operators';
import { Tournament } from '@/tournament/_models/tournament';
import { ListCoursesComponent } from '../list-courses/list-courses.component';


@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    imports: [ListCoursesComponent, ReactiveFormsModule, RouterLink]
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
              private readonly router: Router,
              private readonly formBuilder: FormBuilder,
              private readonly httpService: HttpService) {
  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
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
