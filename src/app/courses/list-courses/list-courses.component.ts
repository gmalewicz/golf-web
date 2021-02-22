import { Course } from '@/_models/course';
import { Courses } from '@/_models/courses';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { Component, Input, OnInit } from '@angular/core';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons/faMinusCircle';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons/faSearchPlus';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons/index';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-list-courses',
  templateUrl: './list-courses.component.html',
  styleUrls: ['./list-courses.component.css']
})
export class ListCoursesComponent implements OnInit {

  @Input() parent: string;
  @Input() courses: Courses;
  @Input() selectedTab: number;

  dispProgress: boolean;

  courseLst: Course[];

  faSearchPlus: IconDefinition;
  faMinusCircle: IconDefinition;
  faPlusCircle: IconDefinition;

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private alertService: AlertService) { }

  ngOnInit(): void {

    this.faSearchPlus = faSearchPlus;
    this.faPlusCircle = faPlusCircle;
    this.faMinusCircle = faMinusCircle;
    this.dispProgress = false;

    if (this.selectedTab === 0 && this.courses.favourites === undefined) {

      this.dispProgress = true;

      this.httpService.getFavouriteCourses(this.authenticationService.currentPlayerValue.id).pipe(
        tap(
          retCourses => {
            this.courses.favourites = retCourses;
            this.courseLst = retCourses;
            this.dispProgress = false;
          })
      ).subscribe();
    } else if  (this.selectedTab === 1) {
      this.courseLst = this.courses.searchRes;
    } else if  (this.selectedTab === 2 && this.courses.all === undefined) {
      this.dispProgress = true;
      this.httpService.getCourses().pipe(
        tap(
          retCourses => {
            this.courses.all = retCourses;
            this.courseLst = retCourses;

            this.dispProgress = false;
          })
      ).subscribe();
    } else if (this.selectedTab === 0 ) {
      this.courseLst = this.courses.favourites;
    } else {
      this.courseLst = this.courses.all;
    }
  }

  getIcon() {
    if (this.selectedTab === 0) {
        return this.faMinusCircle;
    }
    return this.faPlusCircle;
  }

  private isInFavourites(course: Course): boolean {
    if (this.courses.favourites.find(c => c.id === course.id) != null) {
      return true;
    }
    return false;
  }

  onClickFavourite(course: Course) {

    if (this.selectedTab === 1) {
      if (!this.isInFavourites(course)) {
        this.httpService.addToFavouriteCourses(course, this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.courses.favourites.push(course);
              this.alertService.success(course.name + ' added to favourites.', false);
            })
        ).subscribe();
      } else {
        this.alertService.error(course.name + ' already added to favourites.', false);
      }
    } else {
      this.httpService.deleteFromFavourites(course, this.authenticationService.currentPlayerValue.id).pipe(
        tap(
          () => {
            this.alertService.success(course.name + ' removed from favourites.', true);
            this.courses.favourites = this.courses.favourites.filter(c => c.id !== course.id);
            this.courseLst = this.courses.favourites;
          })
      ).subscribe();
    }
  }
}
