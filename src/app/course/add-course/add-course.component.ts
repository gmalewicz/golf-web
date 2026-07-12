import { Component, OnInit, viewChild, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { Hole, Course } from '@/_models';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { tap } from 'rxjs/operators';
import { CourseNavigationService } from '../_services/course-navigation.service';
import { CourseTeesComponent } from '../course-tees/course-tees.component';
import { AddTeeComponent } from '../add-tee/add-tee.component';
import { NgClass } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthGuard } from '@/_helpers/auth.guard';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';

@Component({
    selector: 'app-add-course',
    imports: [CourseTeesComponent,
        AddTeeComponent,
        NgClass,
        BaseChartDirective,
        MatInputModule,
        ReactiveFormsModule,
        MatSelectModule,
        RouterModule,
        LoadingDirective],
    templateUrl: './add-course.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './add-course.component.css'
})
export class AddCourseComponent implements OnInit {
  private readonly httpService = inject(HttpService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly alertService = inject(AlertService);
  private readonly courseNavigationService = inject(CourseNavigationService);

  chart = viewChild(BaseChartDirective);

  // ── constant fields (never change after init) ────────────────────────────────
  readonly barChartType: ChartType = 'bar';
  readonly barChartLegend = true;
  readonly parButtons = [3, 4, 5, 6];
  readonly nbrHoles = [{ label: '18', value: 18 }, { label: '9', value: 9 }];

  // ── non-reactive internal state ──────────────────────────────────────────────
  updatingHole = 0;
  pars: number[] = [];
  si: number[] = [];
  public newCourseForm!: FormGroup;

  // ── signals ──────────────────────────────────────────────────────────────────
  loading = signal(false);
  display = signal(false);
  barChartLabels = signal<string[]>([]);
  barChartData = signal<ChartDataset[]>([]);
  barChartOptions = signal<ChartOptions>({} as ChartOptions);
  holeSelectorActive = signal<{ active: boolean }[]>(new Array(18).fill({ active: false }));
  parSelectorActive = signal<{ active: boolean }[]>(new Array(4).fill({ active: false }));
  siSelectorActive = signal<{ active: boolean }[]>(new Array(18).fill({ active: false }));

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.newCourseForm = this.formBuilder.group({
        courseName: ['', Validators.required],
        coursePar: ['', [Validators.required, Validators.pattern('[3-7][0-9]$')]],
        nbrHolesDropDown: ['', [Validators.required]]
      });

      this.updatingHole = 0;
      this.pars = new Array(18).fill(0);
      this.courseNavigationService.init();
      this.clearSi();
      this.courseNavigationService.removeTee.set(true);

      if (this.courseNavigationService.cloneCourse() != undefined) {
        this.cloneCourseData(this.courseNavigationService.cloneCourse());
        this.courseNavigationService.cloneCourse.set(undefined);
      }
      this.generateLabelsAndData();
      this.display.set(true);
    }
  }

  private cloneCourseData(course: Course) {
    this.f.courseName.setValue(course.name + ' copy');
    this.f.coursePar.setValue(course.par);
    this.f.nbrHolesDropDown.setValue(course.holeNbr);

    this.pars = course.holes.map(hole => hole.par);
    this.si = course.holes.map(hole => hole.si);
    this.barChartLabels.set(new Array(18).fill(0).map((_x, i) => '' + (i + 1) + '(' + (this.si[i] + 1) + ')'));

    // load tees
    this.httpService.getTees(course.id).pipe(
      tap((tees) => {
        // clear ids for each tee
        tees.forEach(tee => tee.id = undefined);
        this.courseNavigationService.tees.set(tees);
      })
    ).subscribe();
  }

  clearSi() {
    this.si = new Array(18).fill(0);
    this.barChartLabels.set(new Array(18).fill(0).map((_x, i) => '' + (i + 1)));
  }

  // convenience getter for easy access to form fields
  get f() { return this.newCourseForm.controls; }

  private generateLabelsAndData() {

    this.barChartData.set([{
      data: [...this.pars],
      label: 'Par(SI)',
      backgroundColor: 'purple',
      borderWidth: 1
    }]);

    this.barChartOptions.set({
      responsive: true,
      scales: {
        y: { min: 2, max: 6, ticks: { stepSize: 1 } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (tooltipItem: { label: string; }[]) => 'Hole: ' + tooltipItem[0].label
          }
        }
      }
    });
  }

  selectHole(hole: number) {

    this.updatingHole = hole;

    const holeArr = new Array(this.holeSelectorActive().length).fill({ active: false });
    holeArr[this.updatingHole] = { active: true };
    this.holeSelectorActive.set(holeArr);

    const parArr = new Array(this.parSelectorActive().length).fill({ active: false });
    if (this.pars[this.updatingHole] > 0) {
      parArr[this.pars[this.updatingHole] - 3] = { active: true };
    }
    this.parSelectorActive.set(parArr);

    const siArr = new Array(this.siSelectorActive().length).fill({ active: false });
    if (this.si[this.updatingHole] > 0) {
      siArr[this.si[this.updatingHole] - 1] = { active: true };
    }
    this.siSelectorActive.set(siArr);
  }

  selectPar(par: number) {

    this.pars[this.updatingHole] = par;

    const parArr = new Array(this.parSelectorActive().length).fill({ active: false });
    parArr[this.pars[this.updatingHole] - 3] = { active: true };
    this.parSelectorActive.set(parArr);

    this.barChartData.update(data => {
      const newData = [...data];
      newData[0] = { ...newData[0], data: [...this.pars] };
      return newData;
    });

    this.chart()?.chart?.update();
  }

  selectSi(si: number) {

    // check if that si has been already used
    if (this.si.includes(si + 1)) {
      this.alertService.error($localize`:@@addCourse-wrongSI:The same SI cannot be assigned twice to the same hole`, false);
      return;
    }

    this.si[this.updatingHole] = si + 1;

    const siArr = new Array(this.siSelectorActive().length).fill({ active: false });
    siArr[si] = { active: true };
    this.siSelectorActive.set(siArr);

    // update label for this hole
    const newLabels = [...this.barChartLabels()];
    newLabels[this.updatingHole] = '' + (this.updatingHole + 1) + '(' + (si + 1) + ')';
    this.barChartLabels.set(newLabels);

    this.chart()?.chart?.update();
  }

  onSubmit() {

    this.newCourseForm.markAllAsTouched();

    if (this.newCourseForm.invalid || !this.allDataSet()) {
      return;
    }

    this.loading.set(true);

    const newHoles: Hole[] = [];
    for (let hole = 0; hole < 18; hole++) {
      newHoles.push({ par: this.pars[hole], number: hole + 1, si: this.si[hole] });
    }

    const course: Course = {
      name: this.f.courseName.value,
      par: +this.f.coursePar.value,
      holes: newHoles,
      tees: this.courseNavigationService.tees(),
      holeNbr: this.f.nbrHolesDropDown.value
    };

    this.httpService.addCourse(course).pipe(
      tap(() => {
        this.alertService.success($localize`:@@addCourse-addedSuccess:The course ${this.f.courseName.value} successfully added`, true);
        this.router.navigate(['/home']).catch(error => console.log(error));
      })
    ).subscribe();
  }

  clear() {

    this.newCourseForm.reset();

    this.siSelectorActive.set(new Array(this.siSelectorActive().length).fill({ active: false }));
    this.parSelectorActive.set(new Array(this.parSelectorActive().length).fill({ active: false }));

    const holeArr = new Array(this.holeSelectorActive().length).fill({ active: false });
    holeArr[0] = { active: true };
    this.holeSelectorActive.set(holeArr);

    this.si.fill(0);
    this.pars.fill(0);

    this.barChartData.update(data => {
      const newData = [...data];
      newData[0] = { ...newData[0], data: [...this.pars] };
      return newData;
    });

    this.barChartLabels.set(new Array(18).fill(0).map((_x, i) => '' + (i + 1)));
    this.updatingHole = 0;
    this.courseNavigationService.init();
  }

  private allDataSet(): boolean {

    if (this.pars.includes(0)) {
      this.alertService.error($localize`:@@addCourse-ParNotSet:Pars are not set for all holes`, false);
      return false;
    }
    if (this.si.includes(0)) {
      this.alertService.error($localize`:@@addCourse-SINotSet:SI are not set for all holes`, false);
      return false;
    }
    if (this.courseNavigationService.tees().length < 1) {
      this.alertService.error($localize`:@@addCourse-TeeNotSet:At least one tee must be defined`, false);
      return false;
    }
    return true;
  }
}

export const addCourseRoutes: Routes = [
  { path: '', component: AddCourseComponent, canActivate: [AuthGuard] }
];


