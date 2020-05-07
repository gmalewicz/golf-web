import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit} from '@angular/core';
import { HttpService } from '../_services/http.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Course, ScoreCard, Round } from '@/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, AlertService } from '@/_services';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-add-scorecard',
  templateUrl: './add-scorecard.component.html',
  styleUrls: ['./add-scorecard.component.css']
})
export class AddScorecardComponent implements OnInit {

  loading = false;

  // show: string;
  course: Course;
  display = false;

  submitted = false;

  public addScorecardForm: FormGroup;

  // date: Date;
  // teeTime: Date;

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartLabels: number[] = [];
  public barChartData: ChartDataSets[];
  public barChartOptions: ChartOptions;

  updatingHhole = 0;
  public strokeButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  public patButtons = [0, 1, 2, 3, 4, 5];

  public holeSelectorActive = Array(18);
  public strokeSelectorActive = Array(10);
  public patSelectorActive = Array(6);

  strokes: number[] = [];
  putts: number[] = [];

  displayResult = '';

  constructor(private httpService: HttpService,
              private route: ActivatedRoute,
              private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              private router: Router,
              private alertService: AlertService) {

    this.holeSelectorActive.fill({active: false});
    this.strokeSelectorActive.fill({active: false});
    this.patSelectorActive.fill({active: false});
    this.getHoles();

  }

  ngOnInit(): void {
    this.addScorecardForm = this.formBuilder.group({
      date: ['', [Validators.required, Validators.pattern('([0-9]{4})\/([0-9]{1,2})\/([0-9]{1,2})')]],
      teeTime: ['', [Validators.required, Validators.pattern('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$')]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.addScorecardForm.controls; }

  generateLabelsAndData() {

    console.log('generate labels & data');

    const barData: number[] = [];
    this.barChartLabels = [];

    for (let hole = 1; hole <= 18; hole++) {
      this.barChartLabels.push(hole);
      barData.push(this.course.holes[hole - 1].par);
      this.strokes.push(0);
      this.putts.push(0);
    }

    this.barChartData = [{stack: 'Stack 0', label: 'Par',  data: barData, backgroundColor: 'purple', borderWidth: 1 },
                         {stack: 'Stack 1', label: 'Strokes', data: this.strokes, backgroundColor : 'red', borderWidth : 1},
                         {stack: 'Stack 1', label: 'Putts', data: this.putts, backgroundColor : 'blue', borderWidth : 1}];

    console.log(this.barChartLabels);
    console.log(this.barChartData);

    this.barChartOptions = {
      responsive: true,
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 10,
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

  getHoles() {
    this.httpService.getHoles(this.route.snapshot.params.courseId).subscribe(retHoles => {
      console.log(retHoles);

      this.course = {
        id: this.route.snapshot.params.courseId,
        name: this.route.snapshot.params.courseName,
        par: this.route.snapshot.params.coursePar,
        holes: retHoles
      };
      this.generateLabelsAndData();
      this.display = true;
    });
  }

  clear() {

    this.alertService.clear();
    this.putts.fill(0);
    this.strokes.fill(0);
    this.barChartData[1].data = this.strokes;
    this.barChartData[2].data = this.putts;
    this.holeSelectorActive.fill({active: false});
    this.strokeSelectorActive.fill({active: false});
    this.patSelectorActive.fill({active: false});
    this.displayResult = '';
  }

  onSubmit() {

    this.alertService.clear();

    this.submitted = true;

    if (this.addScorecardForm.invalid) {
      return;
    }

    this.loading = true;

    const scoreCard: ScoreCard[] = [];

    for (let hole = 0; hole < 18; hole++) {
      scoreCard.push({hole: hole + 1, stroke: this.strokes[hole], pats: this.putts[hole]});
    }


    const round: Round = {
      course: this.course,
      roundDate: this.f.date.value + ' ' + this.f.teeTime.value,
      player: [this.authenticationService.currentPlayerValue],
      scoreCard
    };

    this.httpService.addRound(round).subscribe(data => {
      console.log('round added');
      this.display = false;
      this.alertService.success('The round at ' + this.f.date.value + ' ' + this.f.teeTime.value + ' successfully added', true);
      this.router.navigate(['/']);
    },
    (error: HttpErrorResponse) => {
      // console.log(error.error.message);
      this.alertService.error(error.error.message, true);
      this.loading = false;
  });
  }

  selectHole(hole: number) {

    this.alertService.clear();

    console.log('selected hole: ' + hole);
    this.updatingHhole = hole;
    this.strokeSelectorActive.fill({active: false});
    this.patSelectorActive.fill({active: false});

    if (this.strokes[hole - 1] > 0) {
      this.strokeSelectorActive[this.strokes[hole - 1] - 1] = {active: true};
    }

    if (this.putts[hole - 1] > 0) {
      this.patSelectorActive[this.putts[hole - 1]] = {active: true};
    }

    // to highlight 0 putts
    if (this.putts[hole - 1] === 0 && this.strokes[hole - 1] > 0) {
      this.patSelectorActive[this.putts[hole - 1]] = {active: true};
    }

  }

  selectStroke(stroke: number) {

    this.alertService.clear();

    console.log('selected stroke: ' + stroke);

     // number of pats cannot be greater than number of strokes
    if (stroke < this.putts[this.updatingHhole - 1]) {
      this.alertService.error('Number of putts cannot be greater than number of strokes', false);
      return;
    }

    const updatedStrokes = [];
    const updatedPats = [];

    for (let hole = 0; hole < 18; hole++) {

      updatedPats.push(this.putts[hole]);
      updatedStrokes.push(this.strokes[hole] - this.putts[hole]);

    }
    console.log('updated strokes: ' + updatedStrokes);

    this.strokes[this.updatingHhole - 1] = stroke;
    updatedStrokes[this.updatingHhole - 1] = stroke - this.putts[this.updatingHhole - 1];

    this.barChartData[1].data = updatedStrokes;

    const result = this.strokes.reduce((p, c) => p + c);

    const difference = result - this.course.par;

    let differenceStr = '' + difference;
    if (difference > 0) {
      differenceStr = '+' + difference;
    }

    this.displayResult = result +  '/' + this.course.par + ' (' + differenceStr + ')';
  }

  selectPat(pat: number) {

    this.alertService.clear();

    console.log('selected pat: ' + pat);

    // number of pats cannot be greater than number of strokes
    if (pat > this.strokes[this.updatingHhole - 1]) {
      this.alertService.error('Number of pats cannot be greater than number of strokes', false);
      return;
    }


    const updatedPats = [];
    const updatedStrokes = [];

    for (let hole = 0; hole < 18; hole++) {

      updatedPats.push(this.putts[hole]);
      updatedStrokes.push(this.strokes[hole] - this.putts[hole]);

    }

    this.putts[this.updatingHhole - 1] = pat;
    updatedPats[this.updatingHhole - 1] = pat;

    updatedStrokes[this.updatingHhole - 1] = this.strokes[this.updatingHhole - 1] - pat;

    this.barChartData[1].data = updatedStrokes;
    this.barChartData[2].data = updatedPats;

  }
}
