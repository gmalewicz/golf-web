import { Course } from "@/_models/course";
import { Courses } from "@/_models/courses";
import { AlertService } from "@/_services/alert.service";
import { AuthenticationService } from "@/_services/authentication.service";
import { HttpService } from "@/_services/http.service";
import { Component, OnInit, input, output, inject, ChangeDetectionStrategy, signal, computed, DestroyRef } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  faMinusCircle,
  faPlusCircle,
  faSearchPlus,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { tap } from "rxjs/operators";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { RouterLink } from "@angular/router";
import { Tournament } from "@/tournament/_models/tournament";
import { LoadingDirective } from "@/_helpers/directives/LoadingDirective";

@Component({
  selector: "app-list-courses",
  templateUrl: "./list-courses.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FaIconComponent, LoadingDirective],
})
export class ListCoursesComponent implements OnInit {
  private readonly httpService = inject(HttpService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly alertService = inject(AlertService);
  private readonly destroyRef = inject(DestroyRef);

  data = input.required<{ parent: string; tournament?: Tournament }>();
  courses = input.required<Courses>();
  selectedTab = input.required<number>();

  readonly coursesChange = output<Courses>();

  readonly dispProgress = signal(false);
  readonly loadingFav = signal(false);
  readonly courseLst = computed<Course[]>(() => {
    const tab = this.selectedTab();
    const c = this.courses();
    if (tab === 0) return c.favourites ?? [];
    if (tab === 1) return c.searchRes ?? [];
    if (tab === 2) return c.all ?? [];
    return [];
  });

  readonly faSearchPlus: IconDefinition = faSearchPlus;
  readonly faMinusCircle: IconDefinition = faMinusCircle;
  readonly faPlusCircle: IconDefinition = faPlusCircle;

  ngOnInit(): void {
    if (this.selectedTab() === 0 && this.courses().favourites === undefined) {
      this.dispProgress.set(true);
      this.httpService
        .getFavouriteCourses(this.authenticationService.currentPlayerValue.id)
        .pipe(
          tap((retCourses) => {
            this.coursesChange.emit({ ...this.courses(), favourites: retCourses });
            this.dispProgress.set(false);
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    } else if (this.selectedTab() === 2 && this.courses().all === undefined) {
      this.dispProgress.set(true);
      this.httpService
        .getCourses()
        .pipe(
          tap((retCourses) => {
            this.coursesChange.emit({ ...this.courses(), all: retCourses });
            this.dispProgress.set(false);
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();
    }
  }

  getIcon() {
    if (this.selectedTab() === 0) {
      return this.faMinusCircle;
    }
    return this.faPlusCircle;
  }

  private isInFavourites(course: Course): boolean {
    return this.courses().favourites.some((c) => c.id === course.id);
  }

  onClickFavourite(course: Course) {
    this.loadingFav.set(true);

    // TAB ≠ 0 → Add to favourites
    if (this.selectedTab() !== 0) {
      if (this.isInFavourites(course)) {
        this.alertService.success(
          $localize`:@@listCourses-alreadyAddedFavourites:${course.name} already added to favourites.`,
          false,
        );
        this.loadingFav.set(false);
        return;
      }

      this.httpService
        .addToFavouriteCourses(
          course,
          this.authenticationService.currentPlayerValue.id,
        )
        .pipe(
          tap(() => {
            this.coursesChange.emit({ ...this.courses(), favourites: [...(this.courses().favourites ?? []), course] });
            this.alertService.success(
              $localize`:@@listCourses-addedFavourites:${course.name} added to favourites.`,
              false,
            );
            this.loadingFav.set(false);
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe();

      return;
    }

    // TAB = 0 → Remove from favourites
    this.httpService
      .deleteFromFavourites(
        course,
        this.authenticationService.currentPlayerValue.id,
      )
      .pipe(
        tap(() => {
          this.alertService.success(
            $localize`:@@listCourses-removeFavourites:${course.name} removed from favourites.`,
            false,
          );
          this.coursesChange.emit({
            ...this.courses(),
            favourites: this.courses().favourites.filter((c) => c.id !== course.id),
          });
          this.loadingFav.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
