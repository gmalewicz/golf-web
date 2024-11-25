import { Course } from '@/_models/course';
import { Courses } from '@/_models/courses';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { Component, OnInit, input } from '@angular/core';
import { faMinusCircle, faPlusCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { tap } from 'rxjs/operators';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { Tournament } from '@/tournament/_models/tournament';


@Component({
    selector: 'app-list-courses',
    templateUrl: './list-courses.component.html',
    imports: [RouterLink, FaIconComponent]
})
export class ListCoursesComponent implements OnInit {

  data = input.required<{parent: string, tournament?: Tournament}>();
  courses = input.required<Courses>();
  selectedTab = input.required<number>();

  dispProgress: boolean;
  loadingFav: boolean;

  courseLst: Course[];

  faSearchPlus: IconDefinition;
  faMinusCircle: IconDefinition;
  faPlusCircle: IconDefinition;

  constructor(private readonly httpService: HttpService,
              private readonly authenticationService: AuthenticationService,
              private readonly alertService: AlertService) { }

  ngOnInit(): void {

    this.faSearchPlus = faSearchPlus;
    this.faPlusCircle = faPlusCircle;
    this.faMinusCircle = faMinusCircle;
    this.dispProgress = false;
    this.loadingFav = false;

    if (this.selectedTab() === 0 && this.courses().favourites === undefined) {

      this.dispProgress = true;

      this.httpService.getFavouriteCourses(this.authenticationService.currentPlayerValue.id).pipe(
        tap(
          retCourses => {
            this.courses().favourites = retCourses;
            this.courseLst = retCourses;
            this.dispProgress = false;
          })
      ).subscribe();
    } else if  (this.selectedTab() === 1) {
      this.courseLst = this.courses().searchRes;
    } else if  (this.selectedTab() === 2 && this.courses().all === undefined) {
      this.dispProgress = true;
      this.httpService.getCourses().pipe(
        tap(
          retCourses => {
            this.courses().all = retCourses;
            this.courseLst = retCourses;

            this.dispProgress = false;
          })
      ).subscribe();
    } else if (this.selectedTab() === 0 ) {
      this.courseLst = this.courses().favourites;
    } else {
      this.courseLst = this.courses().all;
    }
  }

  getIcon() {
    if (this.selectedTab() === 0) {
        return this.faMinusCircle;
    }
    return this.faPlusCircle;
  }

  private isInFavourites(course: Course): boolean {
    if (this.courses().favourites.find(c => c.id === course.id) != null) {
      return true;
    }
    return false;
  }

  onClickFavourite(course: Course) {
    this.loadingFav = true;
    if (this.selectedTab() !== 0) {
      if (!this.isInFavourites(course)) {
        this.httpService.addToFavouriteCourses(course, this.authenticationService.currentPlayerValue.id).pipe(
          tap(
            () => {
              this.courses().favourites.push(course);
              this.alertService.success($localize`:@@listCourses-addedFavourites:${course.name} added to favourites.`, false);

              this.loadingFav = false;
            })
        ).subscribe();
      } else {
        this.alertService.success($localize`:@@listCourses-alreadyAddedFavourites:${course.name} already added to favourites.`, false);
        this.loadingFav = false;
      }
    } else {
      this.httpService.deleteFromFavourites(course, this.authenticationService.currentPlayerValue.id).pipe(
        tap(
          () => {
            this.alertService.success($localize`:@@listCourses-removeFavourites:${course.name} removed from favourites.`, false);
            this.courses().favourites = this.courses().favourites.filter(c => c.id !== course.id);
            this.courseLst = this.courses().favourites;
            this.loadingFav = false;
          })
      ).subscribe();
    }
  }
}
