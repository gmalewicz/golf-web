
import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Hole, Course } from '@/_models';
import { ChartDataset, ChartOptions, ChartType } from 'chart.js';
import { Router, RouterModule, Routes } from '@angular/router';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { tap } from 'rxjs/operators';
import { CourseNavigationService } from '../_services/course-navigation.service';
import { BaseChartDirective } from 'ng2-charts';
import { CourseTeesComponent } from '../course-tees/course-tees.component';
import { AuthGuard } from '@/_helpers/auth.guard';
import { AddTeeComponent } from '../add-tee/add-tee.component';
import { CanDirective } from '@/_helpers/directives/CanDirective';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';

@Component({
    selector: 'app-course',
    imports: [BaseChartDirective,
              CourseTeesComponent,
              RouterModule,
              AddTeeComponent,
              CanDirective,
              LoadingDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './course.component.html'
})
export class CourseComponent implements OnInit {
  private readonly httpService = inject(HttpService);
  private readonly alertService = inject(AlertService);
  authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly courseNavigationService = inject(CourseNavigationService);

  // ── constant fields ──────────────────────────────────────────────────────────
  readonly barChartType: ChartType = 'bar';

  // ── non-reactive internal state ──────────────────────────────────────────────
  course!: Course;
  holes: Array<Hole> = [];
  barData: number[] = [];

  // ── signals ──────────────────────────────────────────────────────────────────
  loadingTees = signal(false);
  loadingClone = signal(false);
  loadingDelete = signal(false);
  display = signal(false);
  displayTees = signal(false);
  displayAddTee = signal(false);
  showTeesLbl = signal($localize`:@@course-showTees:Show tees`);
  barChartLabels = signal<string[]>([]);
  barChartData = signal<ChartDataset[]>([]);
  barChartOptions = signal<ChartOptions>({} as ChartOptions);

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.courseNavigationService.init();
      this.course = history.state.data.course;

      this.courseNavigationService.removeTee.set(false);
      this.courseNavigationService.course.set(this.course);

      this.getHoles();
    }
  }

  getHoles() {
    this.httpService.getHoles(this.course.id).subscribe(retHoles => {
      this.holes = retHoles;
      this.generateLabelsAndData();
      this.display.set(true);
    });
  }

  generateLabelsAndData() {

    const newLabels: string[] = [];
    const newBarData: number[] = [];

    for (const hole of this.holes) {
      newLabels.push(hole.number + '(' + hole.si + ')');
      newBarData.push(hole.par);
    }
    this.barData = newBarData;
    this.barChartLabels.set(newLabels);

    let text = this.course.name + ' - Par: ' + this.course.par;
    if (this.authenticationService.playerRole.includes('ADMIN')) {
      text = text + ' (' + this.course.id + ')';
    }

    this.barChartData.set([{ data: this.barData, label: 'Par(SI)', backgroundColor: 'purple', borderWidth: 1 }]);

    this.barChartOptions.set({
      responsive: true,
      scales: {
        y: { min: 2, max: 6, ticks: { stepSize: 1 } }
      },
      plugins: {
        title: {
          display: true,
          text,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            title: (tooltipItem: { label: string; }[]) => $localize`:@@course-hole:Hole ` + tooltipItem[0].label
          }
        }
      }
    });
  }

  onShowTees() {

    this.displayTees.update(v => !v);

    if (this.displayTees() && this.courseNavigationService.tees().length === 0) {
      this.loadingTees.set(true);
      this.httpService.getTees(this.course.id).pipe(
        tap((tees) => {
          this.courseNavigationService.tees.set(tees);
          this.loadingTees.set(false);
        })
      ).subscribe();
    }

    this.showTeesLbl.set(this.displayTees()
      ? $localize`:@@course-hideTees:Hide tees`
      : $localize`:@@course-showTees:Show tees`);
  }

  deleteCourse() {

    this.loadingDelete.set(true);

    this.httpService.deleteCourse(this.course.id).pipe(
      tap(() => {
        this.alertService.success($localize`:@@course-DelMsg:The course has been successfully deleted`, true);
        this.router.navigate(['/home']).catch(error => console.log(error));
      })
    ).subscribe();
  }

  clone() {
    this.loadingClone.set(true);
    this.course.holes = this.holes;
    this.courseNavigationService.cloneCourse.set(this.course);
    this.router.navigate(['/addCourse']).catch(error => console.log(error));
  }

  addTee() {

    this.courseNavigationService.addTee.set(true);

    if (!this.displayAddTee()) {
      this.displayAddTee.set(true);
    }

    if (!this.displayTees()) {
      this.onShowTees();
    }
  }
}

export const courseRoutes: Routes = [
  { path: '', component: CourseComponent, canActivate: [AuthGuard] }
];

