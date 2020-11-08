import { Component, OnInit} from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Course } from '@/_models';
import { Router } from '@angular/router';
import { AlertService, AuthenticationService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  faSearchPlus: IconDefinition;
  courses: Array<Course>;

  // parent who call me
  parent: string;

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {
      this.parent = history.state.data.parent;
      this.faSearchPlus = faSearchPlus;
      // console.log('requested parent is: ' + this.parent);
      this.getCourses();
    }
  }

  getCourses() {
    this.httpService.getCourses().subscribe(retCourses => {
      // console.log(retCourses);
      this.courses = retCourses;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Getting list of courses failed', false);
    });
  }
}
