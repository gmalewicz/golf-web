import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Hole, Course, Tee } from '@/_models';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css']
})
export class AddCourseComponent implements OnInit {

  loading: boolean;

  // selectedPar = null;

  public newCourseForm: FormGroup;
  submitted: boolean;
  addTeeSubmitted: boolean;

  public barChartType: ChartType;
  public barChartLegend;
  public barChartLabels: string[];
  public barChartData: ChartDataSets[];
  public barChartOptions: ChartOptions;

  public parButtons: number[];
  public parSelectorActive: { active: boolean }[];
  public holeSelectorActive: { active: boolean }[];
  public siSelectorActive: { active: boolean }[];

  public display: boolean;

  updatingHole: number;
  pars: number[];
  si: number[];
  tees: Tee[];

  teeTypes: { label: string; value: number; }[];

  nbrHoles: { label: string; value: number; }[];

  constructor(private httpService: HttpService,
              private formBuilder: FormBuilder,
              private router: Router,
              public authenticationService: AuthenticationService,
              private alertService: AlertService) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.newCourseForm = this.formBuilder.group({
        courseName: ['', Validators.required],
        coursePar: ['', [Validators.required, Validators.pattern('[3-7][0-9]$')]],
        tee: ['', Validators.required],
        cr: ['', [ Validators.required, Validators.pattern('[2-8][0-9].?[0-9]?')]],
        sr: ['', [ Validators.required, Validators.pattern('[1-2]?[0-9][0-9]$')]],
        teeTypeDropDown: ['', [Validators.required]],
        nbrHolesDropDown: ['', [Validators.required]]
      });
      // initialize all buttons for net selected
      this.parSelectorActive = Array(4).fill({ active: false });
      this.siSelectorActive = Array(18).fill({ active: false });
      this.holeSelectorActive = Array(18).fill({ active: false });

      // initialize tee types
      this.teeTypes = [{ label: '1-18', value: 0 },
                      { label: '1-9', value: 1 },
                      { label: '10-18', value: 2 }];

      this.nbrHoles = [{ label: '18', value: 18 },
                      { label: '9', value: 9 }];

      this.updatingHole = 0;
      this.pars = [];
      this.si = [];
      this.tees = [];

      this.barChartType = 'bar';
      this.barChartLegend = true;
      this.barChartLabels = [];
      this.submitted = false;
      this.addTeeSubmitted = false;
      this.loading = false;
      this.parButtons = [3, 4, 5, 6];

      this.generateLabelsAndData();

      this.display = true;

    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.newCourseForm.controls; }

  generateLabelsAndData() {

    // initialize data
    const chartPars = Array(18).fill(0);
    this.pars = Array(18).fill(0);
    this.si = Array(18).fill(0);
    this.barChartLabels = Array(18).fill(0).map((x, i) => '' + (i + 1));

    // set bar chart data
    this.barChartData = [{ data: chartPars, label: 'Par(SI)', backgroundColor: 'purple', borderWidth: 1 }];

    // set bar chart options
    this.barChartOptions = {
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            min: 2,
            max: 6,
            stepSize: 1
          }
        }]
      },
      tooltips: {
        callbacks: {
          title: (tooltipItem: { xLabel: string; }[]) => 'Hole: ' + tooltipItem[0].xLabel
        }
      }
    };

  }

  selectHole(hole: number) {
    // console.log('selected hole: ' + hole);

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

    console.log('Selected par: ' + par);

    // clear error
    this.alertService.clear();

    // save selected par
    this.pars[this.updatingHole] = par;

    // recreate bar data for refresh purposes
    // note that data canot be updated, it needs to be recreated
    this.barChartData[0].data = null;
    this.barChartData[0].data = Array(18).fill(0).map((x, i) => this.pars[i]);
  }

  selectSi(si: number) {

    // console.log('Selected si: ' + si);

    // clear error
    this.alertService.clear();

    // check if that si has been already used
    if (this.si.includes(si + 1)) {
      this.alertService.error('The same SI cannot be assigned twice to the same hole', false);
      return;
    }

    // save selected si
    this.si[this.updatingHole] = si + 1;

    // clean up par, hole and si pressed buttons
    this.siSelectorActive.fill({ active: false });

    // dispaly pressed button until another hole button is pressed
    this.siSelectorActive[this.updatingHole] = ({ active: true });

    // updated label: in case of label recreation is not needed - lable can be just updated
    this.barChartLabels[this.updatingHole] = '' + (this.updatingHole + 1) + '(' + (si + 1) + ')';

  }

  onSubmit() {

    // needed to indicate if main form has been submitted
    this.submitted = true;

    // verify form data and other entries
    if (this.f.courseName.invalid || this.f.coursePar.invalid || !this.allDataSet()) {
      // console.log('all data set');
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
      tees: this.tees,
      holeNbr: this.f.nbrHolesDropDown.value
    });

    // send Course to the server
    this.httpService.addCourse(course).subscribe(() => {

      this.alertService.success('The course ' + this.f.courseName.value + ' successfully added', true);
      this.router.navigate(['/']);
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.error + ' ' + error.error.message, true);
        this.loading = false;
      });
  }

  clear() {

    console.log(this.f.courseName.value);
    // clear error
    this.alertService.clear();

    // clear couse name, par and number of holes
    this.f.courseName.reset();
    this.f.coursePar.reset();
    this.f.nbrHolesDropDown.reset();


    // clear button selections
    this.siSelectorActive.fill({ active: false });
    this.parSelectorActive.fill({ active: false });
    this.holeSelectorActive.fill({ active: false });

    // clear choosen pars, si and chart data
    this.si.fill(0);
    this.pars.fill(0);
    this.barChartData[0].data = this.pars;
    // initialize chart labels
    this.barChartLabels = Array(18).fill(0).map((x, i) => '' + (i + 1));

    // set first hole as an active one
    this.updatingHole = 0;
    this.holeSelectorActive[0] = ({ active: true });

    // clear tees
    this.tees = [];
    this.f.tee.reset();
    this.f.cr.reset();
    this.f.sr.reset();
    this.f.teeTypeDropDown.reset();
  }

  private allDataSet(): boolean {

    // verify if all pars are set
    if (this.pars.includes(0)) {
      this.alertService.error('Pars are not set for all holes', false);
      return false;
    }
    // verify if all SI are set
    if (this.si.includes(0)) {
      this.alertService.error('SI are not set for all holes', false);
      return false;
    }

    // verify if at least one tee is defined
    if (this.tees.length < 1) {
      this.alertService.error('At least one tee must be defined', false);
      return false;
    }

    return true;
  }

  addTee(): void {

    // mark that tee data have been submitted
    this.addTeeSubmitted = true;

    // display errors if any
    if (this.f.tee.invalid || this.f.cr.invalid || this.f.sr.invalid) {
      return;
    }

    // save tee
    this.tees.push({
      tee: this.f.tee.value, cr: this.f.cr.value, sr: this.f.sr.value,
      teeType: this.f.teeTypeDropDown.value
    });

    // clare submit flag to be ready for the next tee
    this.addTeeSubmitted = false;
  }
}
