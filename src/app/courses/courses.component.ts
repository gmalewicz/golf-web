import { Component, OnInit} from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons/faMinusCircle';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons/faSearchPlus';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons/index';
import { Course } from '@/_models/course';
import { Router } from '@angular/router';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {

  faSearchPlus: IconDefinition;
  faMinusCircle: IconDefinition;
  faPlusCircle: IconDefinition;
  courses: Array<Course>;
  favouriteCourses: Array<Course>;
  allCourses: Array<Course>;
  favourites: boolean;

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
      this.faPlusCircle = faPlusCircle;
      this.faMinusCircle = faMinusCircle;
      // console.log('requested parent is: ' + this.parent);
      this.getFavouriteCourses();
    }
  }

  private getFavouriteCourses() {

    this.favourites = true;

    if (this.favouriteCourses != null) {
      this.courses = this.favouriteCourses;
      // this.courses.forEach(c => c.favourite = true);
      return;
    }

    this.httpService.getFavouriteCourses(this.authenticationService.currentPlayerValue.id).subscribe(retCourses => {
      // console.log(retCourses);
      this.courses = retCourses;
      // this.courses.forEach(c => c.favourite = true);
      this.favouriteCourses = this.courses;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, true);
        this.router.navigate(['/']);
    });
  }

  private getAllCourses() {

    this.favourites = false;

    if (this.allCourses != null) {
      this.courses = this.allCourses;
      // this.courses.forEach(c => c.favourite = false);
      return;
    }

    this.httpService.getCourses().subscribe(retCourses => {
      // console.log(retCourses);
      this.courses = retCourses;
      // this.courses.forEach(c => c.favourite = false);
      this.allCourses = this.courses;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, true);
        this.router.navigate(['/']);
    });
  }

  onClickFavourite(course: Course) {
    // console.log('click favourites');
    if (this.favourites === false) {
      // course.favourite = true;
      if (!this.isInFavourites(course)) {
        this.httpService.addToFavouriteCourses(course, this.authenticationService.currentPlayerValue.id).subscribe(response => {
          // updateFavourites(course);
          this.favouriteCourses.push(course);
          this.alertService.success(course.name + ' added to favourites.', false);
        },
          (error: HttpErrorResponse) => {
            this.alertService.error(error.error.message, true);
            this.router.navigate(['/']);
        });
      } else {
        this.alertService.error(course.name + ' already added to favourites.', false);
      }
    } else {
      this.httpService.deleteFromFavourites(course, this.authenticationService.currentPlayerValue.id).subscribe(response => {
        this.alertService.success(course.name + ' removed from favourites.', true);
        // course.favourite = false;
        // this.getFavouriteCourses();
        this.favouriteCourses = this.favouriteCourses.filter(c => c.id !== course.id);
        this.courses = this.favouriteCourses;
        // console.log(this.favouriteCourses);
      },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.message, true);
          this.router.navigate(['/']);
      });
    }
  }

  private isInFavourites(course: Course): boolean {
    if (this.favouriteCourses.find(c => c.id === course.id) != null) {
      return true;
    }
    return false;
  }


  onToggleAllFavourites() {
    this.alertService.clear();
    if (this.favourites) {
      this.getAllCourses();
    } else {
      this.getFavouriteCourses();
    }
  }

  getIcon() {
    if (this.favourites) {
        return this.faMinusCircle;
    }
    return this.faPlusCircle;
  }
}
