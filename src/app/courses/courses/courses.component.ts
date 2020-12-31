import { Component, OnInit} from '@angular/core';
import { Course } from '@/_models/course';
import { Router } from '@angular/router';
import { AuthenticationService } from '@/_services/authentication.service';
import { Courses } from '@/_models/courses';
import { AlertService } from '@/_services/alert.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  favouriteCourses: Array<Course>;

  // parent who call me
  parent: string;
  selectedTab: number;

  courses: Courses;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService) {
  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {
      this.parent = history.state.data.parent;
      this.selectedTab = 0;
      this.courses = {};
    }
  }

  onTabClick(id: number) {
    this.alertService.clear();
    // console.log(id);
    this.selectedTab = id;
  }
}
