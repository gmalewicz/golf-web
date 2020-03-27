import { Component, OnInit} from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Course } from '@/_models';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private httpService: HttpService, private route: ActivatedRoute) {

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
    });
  }
}
