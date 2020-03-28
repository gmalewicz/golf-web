import { Component, OnInit} from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Course } from '@/_models';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  faSearchPlus = faSearchPlus;

  courses: Array<Course>;

  // parent who call me
  parent: string;

  constructor(private httpService: HttpService, private route: ActivatedRoute, private alertService: AlertService) {

    this.parent = this.route.snapshot.params.parent;

    console.log('requested parent is: ' + this.parent);

    this.getCourses();

  }

  ngOnInit(): void {
  }

  getCourses() {
    this.httpService.getCourses().subscribe(retCourses => {
      console.log(retCourses);
      this.courses = retCourses;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Getting list of courses failed', false);
    });
  }
}
