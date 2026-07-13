import { Component, OnInit, inject, ChangeDetectionStrategy, signal, DestroyRef } from '@angular/core';
import { Course } from '@/_models/course';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '@/_services/authentication.service';
import { Courses } from '@/_models/courses';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpService } from '@/_services';
import { tap } from 'rxjs/operators';
import { Tournament } from '@/tournament/_models/tournament';
import { ListCoursesComponent } from '../list-courses/list-courses.component';
import { CanDirective } from '@/_helpers/directives/CanDirective';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';


@Component({
    selector: 'app-courses',
    templateUrl: './courses.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ListCoursesComponent, 
              ReactiveFormsModule, 
              RouterLink,
              CanDirective,
              LoadingDirective]
})
export class CoursesComponent implements OnInit {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly httpService = inject(HttpService);
  private readonly destroyRef = inject(DestroyRef);

  readonly favouriteCourses = signal<Array<Course>>([]);

  // parent data who call me
  readonly data = signal<{parent: string, tournament?: Tournament} | null>(null);
  readonly selectedTab = signal(0);
  readonly courses = signal<Courses>({});
  readonly loading = signal(false);

  readonly searchCourseForm: FormGroup = this.formBuilder.group({
    courseName: ['']
  });

  ngOnInit(): void {
    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.data.set(history.state.data);
    }
  }

  // convenience getter for easy access to form controls
  get controls() { return this.searchCourseForm.controls; }

  onTabClick(id: number) {
    this.selectedTab.set(id);
    // initialize search result

    if (id === 1 && this.courses().searchRes === undefined) {
      this.loading.set(true);
      this.httpService.getSortedCourses(0).pipe(
        tap(courses => {
          this.loading.set(false);
          this.courses.update(c => ({ ...c, searchRes: courses }));
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
    }
  }

  onKey() {
    // only if at least 3 letters have been provided
    if (this.searchCourseForm.invalid || this.controls.courseName.value.length < 3) {
      return;
    }
    this.loading.set(true);
    this.httpService.searchForCourse(this.controls.courseName.value).pipe(
      tap(courses => {
        this.loading.set(false);
        this.courses.update(c => ({ ...c, searchRes: courses }));
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }
}
