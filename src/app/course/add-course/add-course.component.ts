import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { Hole, Course } from '@/_models';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, Routes } from '@angular/router';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { tap } from 'rxjs/operators';
import { NavigationService } from '../_services/navigation.service';
import { CourseTeesComponent } from '../course-tees/course-tees.component';
import { AddTeeComponent } from '../add-tee/add-tee.component';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthGuard } from '@/_helpers/auth.guard';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CourseTeesComponent,
            AddTeeComponent,
            CommonModule,
            NgChartsModule,
            MatInputModule,
            ReactiveFormsModule,
            MatSelectModule,
            RouterModule],
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css']
})
export class AddCourseComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  loading: boolean;
  public newCourseForm: FormGroup;

  public barChartType: ChartType;
  public barChartLegend: boolean;
  public barChartLabels: string[];
  public barChartData: ChartDataset[];
  public barChartOptions: ChartOptions;

  public parButtons: number[];
  public parSelectorActive: { active: boolean }[];
  public holeSelectorActive: { active: boolean }[];
  public siSelectorActive: { active: boolean }[];

  public display: boolean;

  updatingHole: number;
  pars: number[];
  si: number[];

  nbrHoles: { label: string; value: number; }[];

  constructor(private httpService: HttpService,
              private formBuilder: FormBuilder,
              private router: Router,
              public authenticationService: AuthenticationService,
              private alertService: AlertService,
              private navigationService: NavigationService) {
  }

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

      // initialize all buttons for net selected
      this.parSelectorActive = Array(4).fill({ active: false });
      this.siSelectorActive = Array(18).fill({ active: false });
      this.holeSelectorActive = Array(18).fill({ active: false });

      this.nbrHoles = [{ label: '18', value: 18 },
                      { label: '9', value: 9 }];

      this.updatingHole = 0;
      // initialize data
      this.pars = Array(18).fill(0);
      this.navigationService.init();

      this.barChartType = 'bar';
      this.barChartLegend = true;
      this.clearSi();
      this.loading = false;
      this.parButtons = [3, 4, 5, 6];

      this.navigationService.removeTee.set(true);

      if (this.navigationService.cloneCourse() != undefined) {
        this.cloneCourseData(this.navigationService.cloneCourse());
        this.navigationService.cloneCourse.set(undefined);
      }
      this.generateLabelsAndData();
      this.display = true;
    }
  }

  private cloneCourseData(course: Course) {
    this.f.courseName.setValue(course.name + " copy");
    this.f.coursePar.setValue(course.par);
    this.f.nbrHolesDropDown.setValue(course.holeNbr);

    this.pars = course.holes.map(hole => hole.par);
    this.si = course.holes.map(hole => hole.si);
    this.barChartLabels = Array(18).fill(0).map((_x, i) => '' + (i + 1) + '(' + (this.si[i] + 1) + ')');

    // load tees
    this.httpService.getTees(course.id).pipe(
      tap(
        (tees) => {
          // clear ids for each tee
          tees.forEach(tee => tee.id = undefined);
          this.navigationService.tees.set(tees);
        })
    ).subscribe();

  }

  clearSi() {
    this.si = Array(18).fill(0);
    this.barChartLabels = Array(18).fill(0).map((_x, i) => '' + (i + 1));
  }

  // convenience getter for easy access to form fields
  get f() { return this.newCourseForm.controls; }

  private generateLabelsAndData() {

    // set bar chart data
    this.barChartData = [{ data: this.pars, label: 'Par(SI)', backgroundColor: 'purple', borderWidth: 1 }];

    // set bar chart options
    this.barChartOptions = {
      responsive: true,
      scales: {
        y: {
          min: 2,
          max: 6,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (tooltipItem: { label: string; }[]) => 'Hole: ' + tooltipItem[0].label
          }
        }
      }
    };

  }

  selectHole(hole: number) {

    // clear error
    this.alertService.clear();

    // save updating hole index
    this.updatingHole = hole;

    // clean up par, hole and si pressed buttons
    this.holeSelectorActive.fill({ active: false });
    this.parSelectorActive.fill({ active: false });
    this.siSelectorActive.fill({ active: false });

    // dispaly pressed button until another hole button is pressed
    this.holeSelectorActive[this.updatingHole] = ({ active: true });

    // dispaly pressed button if par has been already marked for that hole
    if (this.pars[this.updatingHole] > 0) {
      this.parSelectorActive[this.pars[this.updatingHole] - 3] = ({ active: true });
    }

    // dispaly pressed button if si has been already marked for that hole
    if (this.si[this.updatingHole] > 0) {
      this.siSelectorActive[this.si[this.updatingHole] - 1] = ({ active: true });
    }
  }

  selectPar(par: number) {

    // clear error
    this.alertService.clear();

    // save selected par
    this.pars[this.updatingHole] = par;


    this.parSelectorActive.fill({ active: false });
    this.parSelectorActive[this.pars[this.updatingHole] - 3] = ({ active: true });


    this.chart.chart.update();
  }

  selectSi(si: number) {

    // clear error
    this.alertService.clear();

    // check if that si has been already used
    if (this.si.includes(si + 1)) {
      this.alertService.error($localize`:@@addCourse-wrongSI:The same SI cannot be assigned twice to the same hole`, false);
      return;
    }

    // save selected si
    this.si[this.updatingHole] = si + 1;

    // clean up par, hole and si pressed buttons
    this.siSelectorActive.fill({ active: false });

    // dispaly pressed button until another hole button is pressed
    this.siSelectorActive[si] = ({ active: true });

    // updated label: in case of label recreation is not needed - lable can be just updated
    this.barChartLabels[this.updatingHole] = '' + (this.updatingHole + 1) + '(' + (si + 1) + ')';

    this.chart.chart.update();

  }

  onSubmit() {

    // mark that tee data have been submitted
    this.newCourseForm.markAllAsTouched();

    // verify form data and other entries
    if (this.newCourseForm.invalid || !this.allDataSet()) {
      return;
    }

    // needed for loading spin button
    this.loading = true;

    // create Hole object array
    const newHoles: Hole[] = [];
    for (let hole = 0; hole < 18; hole++) {
      newHoles.push({ par: this.pars[hole], number: hole + 1, si: this.si[hole] });
    }

    // create Course object
    const course: Course = ({
      name: this.f.courseName.value,
      par: +this.f.coursePar.value,
      holes: newHoles,
      tees: this.navigationService.tees(),
      holeNbr: this.f.nbrHolesDropDown.value
    });

    // send Course to the server
    this.httpService.addCourse(course).pipe(
      tap(
        () => {
          this.alertService.success($localize`:@@addCourse-addedSuccess:The course ${this.f.courseName.value} successfully added`, true);

          this.router.navigate(['/home']).catch(error => console.log(error));
        })
    ).subscribe();
  }

  clear() {

    // clear error
    this.alertService.clear();

    // clear couse name, par and number of holes
    this.newCourseForm.reset();

    // clear button selections
    this.siSelectorActive.fill({ active: false });
    this.parSelectorActive.fill({ active: false });
    this.holeSelectorActive.fill({ active: false });

    // clear choosen pars, si and chart data
    this.si.fill(0);
    this.pars.fill(0);
    this.barChartData[0].data = this.pars;
    // initialize chart labels
    // tslint:disable-next-line: variable-name
    this.barChartLabels = Array(18).fill(0).map((_x, i) => '' + (i + 1));

    // set first hole as an active one
    this.updatingHole = 0;
    this.holeSelectorActive[0] = ({ active: true });

    // clear tees
    this.navigationService.init();
    //this.newCourseTeeForm.reset();
  }

  private allDataSet(): boolean {

    // verify if all pars are set
    if (this.pars.includes(0)) {
      this.alertService.error($localize`:@@addCourse-ParNotSet:Pars are not set for all holes`, false);
      return false;
    }
    // verify if all SI are set
    if (this.si.includes(0)) {
      this.alertService.error($localize`:@@addCourse-SINotSet:SI are not set for all holes`, false);
      return false;
    }

    // verify if at least one tee is defined
    if (this.navigationService.tees().length < 1) {
      this.alertService.error($localize`:@@addCourse-TeeNotSet:At least one tee must be defined`, false);
      return false;
    }

    return true;
  }
}

export const addCourseRoutes: Routes = [

  { path: '', component: AddCourseComponent, canActivate: [AuthGuard] }

];
