import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit} from '@angular/core';
import { HttpService } from '../_services/http.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Course, ScoreCard, Round, Tee } from '@/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, AlertService } from '@/_services';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { getDateAndTime } from '@/_helpers/common';

@Component({
  selector: 'app-add-scorecard',
  templateUrl: './add-scorecard.component.html',
  styleUrls: ['./add-scorecard.component.css']
})
export class AddScorecardComponent implements OnInit {

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;
  round: Round;
  loading: boolean;
  course: Course;
  display: boolean;
  submitted: boolean;

  teeOptions: any[];
  selectedTee: number;

  public addScorecardForm: FormGroup;

  public barChartType: ChartType;
  public barChartLegend: boolean;
  public barChartLabels: number[] ;
  public barChartData: ChartDataSets[];
  public barChartOptions: ChartOptions;

  updatingHole: number;
  public strokeButtons: number[];
  public patButtons: number[];

  public holeSelectorActive: any[];
  public strokeSelectorActive: any[];
  public patSelectorActive: any[];

  strokes: number[];
  putts: number[];

  tee: Tee;
  displayResult: string;
  first9Par: number;

  constructor(private httpService: HttpService,
              private route: ActivatedRoute,
              private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              private router: Router,
              private alertService: AlertService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {

      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      const dateStr = getDateAndTime();

      this.addScorecardForm = this.formBuilder.group({
        date: [dateStr[0], [Validators.required, Validators.pattern('([0-9]{4})\/([0-9]{1,2})\/([0-9]{1,2})')]],
        teeTime: [dateStr[1], [Validators.required, Validators.pattern('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$')]],
        teeDropDown: ['', [ Validators.required ]]
      });

      // initialize buttons and set them not to be marked
      this.holeSelectorActive = Array(18).fill({disabled: true, active: false});
      this.strokeSelectorActive = Array(16).fill({disabled: true, active: false});
      this.patSelectorActive = Array(6).fill({disabled: true, active: false});

      // get round from state in case of edit
      if (history.state.data) {
        this.round = history.state.data.round;
      } else {
        this.round = null;
      }

      this.loading = false;
      this.display = false;
      this.submitted = false;
      this.teeOptions = [];
      this.barChartType = 'bar';
      this.barChartLegend = true;
      this.barChartLabels = [];
      this.updatingHole = 0;
      this.strokeButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      this.patButtons = [0, 1, 2, 3, 4, 5];
      this.strokes = [];
      this.putts = [];
      this.displayResult = '';

      this.getRoundData();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.addScorecardForm.controls; }

  generateLabelsAndData() {

    const barData: number[] = [];
    this.barChartLabels = [];

    const updatedPats = [];
    const updatedStrokes = [];

    for (let hole = 1; hole <= 18; hole++) {
      this.barChartLabels.push(hole);
      barData.push(this.course.holes[hole - 1].par);
      // in case of edit score card
      if (this.round != null) {
        this.strokes.push(this.round.scoreCard[hole - 1].stroke );
        this.putts.push(this.round.scoreCard[hole - 1].pats);
        updatedPats.push(this.putts[hole - 1]);
        updatedStrokes.push(this.strokes[hole - 1] - this.putts[hole - 1]);
      } else {
        this.strokes.push(0);
        this.putts.push(0);
      }
    }

    this.barChartData = [{stack: 'Stack 0', label: 'Par',  data: barData, backgroundColor: 'purple', borderWidth: 1 },
                         {stack: 'Stack 1', label: 'Strokes', data: this.strokes, backgroundColor : 'red', borderWidth : 1},
                         {stack: 'Stack 1', label: 'Putts', data: this.putts, backgroundColor : 'blue', borderWidth : 1}];

    if (this.round != null) {
      this.barChartData[1].data = updatedStrokes;
      this.barChartData[2].data = updatedPats;
      this.f.date.setValue(this.round.roundDate.substr(0, 10));
      this.f.date.disable();
      this.f.teeTime.setValue(this.round.roundDate.substr(11, 5));
      this.f.teeTime.disable();

      // get tee which was played
      this.httpService.getPlayerRoundDetails
        (this.authenticationService.currentPlayerValue.id, this.round.id).subscribe(playerRoundDetails => {
          this.f.teeDropDown.setValue(playerRoundDetails.teeId);
          this.f.teeDropDown.disable();

          // updaate availability of holes, strokes and putts
          this.teeChange(false);
      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
      });
    }

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

  getRoundData() {

    // get list of holes and tees and update course object using received data
    combineLatest([this.httpService.getHoles(this.route.snapshot.params.courseId),
      this.httpService.getTees(this.route.snapshot.params.courseId)]).pipe(tap(
        ([retHoles, retTees]) => {

        this.course = {
          id: this.route.snapshot.params.courseId,
          name: this.route.snapshot.params.courseName,
          par: this.route.snapshot.params.coursePar,
          holes: retHoles,
          tees: retTees
        };

        this.first9Par = this.course.holes.filter((h) => {if (h.number <= 9) { return h.par; }})
                .map(h => h.par ).reduce((p, c) => p + c);

        // create tee labels
        const teeType = ['1-18', '1-9', '10-18'];
        retTees.filter(t => t.sex === this.authenticationService.currentPlayerValue.sex).forEach((t) =>
          this.teeOptions.push({label: t.tee  + ' ' + teeType[t.teeType], value: t.id}));
        this.generateLabelsAndData();
        this.display = true;
      })
    ).subscribe();
  }

  clear() {

    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to clear score card?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
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
      this.dialogRef = null;
    });
  }

  onSubmit() {

    // display dialog box for saving confirmation
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to save score card?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // save if accepted by player
        this.save();
      }
      // do nothing if not
      this.dialogRef = null;
    });
  }

  onCancel() {

    // display dialog box for cancel confirmation
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to exit?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // go to min page if cancel
        this.router.navigate(['/home']);
      }
      // do nthing if not
      this.dialogRef = null;
    });
  }

  save() {

    this.alertService.clear();

    this.submitted = true;

    if (this.addScorecardForm.invalid) {
      return;
    }

    this.loading = true;

    const scoreCard: ScoreCard[] = [];

    for (let hole = 0; hole < 18; hole++) {

      if (this.round == null) {
        scoreCard.push({hole: hole + 1, stroke: this.strokes[hole], pats: this.putts[hole], penalty: 0});
      } else {
        this.round.scoreCard[hole].stroke = this.strokes[hole];
        this.round.scoreCard[hole].pats = this.putts[hole];
      }
    }

    if (this.round == null) {

      const round: Round = {
        course: this.course,
        roundDate: this.f.date.value + ' ' + this.f.teeTime.value,
        // prepare player with only required data
        player: [{id: this.authenticationService.currentPlayerValue.id, whs: this.authenticationService.currentPlayerValue.whs}],
        scoreCard,
        matchPlay: false
      };
      // only selected tee shall be sent, so replace entire list with selected tee
      round.course.tees = round.course.tees.filter((t, i) => t.id === this.f.teeDropDown.value);
      // remove holes from the course not to send data to backend
      round.course.holes = undefined;


      this.httpService.addRound(round).pipe(tap(
        () => {
          this.display = false;
          this.alertService.success('The round at ' + this.f.date.value + ' ' + this.f.teeTime.value + ' successfully added', true);
          this.router.navigate(['/home']);
        })
      ).subscribe();
    } else {
      this.round.roundDate = this.f.date.value + ' ' + this.f.teeTime.value;

      this.httpService.updateRound(this.round).pipe(tap(
        () => {
          this.display = false;
          this.alertService.success('The round at ' + this.f.date.value + ' ' + this.f.teeTime.value + ' successfully updated', true);
          this.router.navigate(['/home']);
        })
      ).subscribe();
    }
  }

  selectHole(hole: number) {

    this.alertService.clear();

    this.updatingHole = hole;
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

     // number of pats cannot be greater than number of strokes
    if (stroke < this.putts[this.updatingHole - 1]) {
      this.alertService.error('Number of putts cannot be greater than number of strokes', false);
      return;
    }

    const updatedStrokes = [];

    for (let hole = 0; hole < 18; hole++) {

      updatedStrokes.push(this.strokes[hole] - this.putts[hole]);

    }

    this.strokes[this.updatingHole - 1] = stroke;

    updatedStrokes[this.updatingHole - 1] = stroke - this.putts[this.updatingHole - 1];

    this.barChartData[1].data = updatedStrokes;

    this.calculateResult();
  }

  private calculateResult() {

    const result = this.strokes.reduce((p, c) => p + c);
    let difference = 0;
    let par = 0;

    if (this.tee.teeType === 1) {
      difference = result - this.first9Par;
      par = this.first9Par;
    } else if (this.tee.teeType === 2) {
      difference = result - this.course.par + this.first9Par;
      par = this.course.par - this.first9Par;
    } else {
      difference = result - this.course.par;
      par = this.course.par;
    }

    let differenceStr = '' + difference;
    if (difference > 0) {
      differenceStr = '+' + difference;
    }

    this.displayResult = result +  '/' + par + ' (' + differenceStr + ')';
  }

  selectPat(pat: number) {

    this.alertService.clear();

    // number of pats cannot be greater than number of strokes
    if (pat > this.strokes[this.updatingHole - 1]) {
      this.alertService.error('Number of pats cannot be greater than number of strokes', false);
      return;
    }


    const updatedPats = [];
    const updatedStrokes = [];

    for (let hole = 0; hole < 18; hole++) {

      updatedPats.push(this.putts[hole]);
      updatedStrokes.push(this.strokes[hole] - this.putts[hole]);

    }

    this.putts[this.updatingHole - 1] = pat;
    updatedPats[this.updatingHole - 1] = pat;

    updatedStrokes[this.updatingHole - 1] = this.strokes[this.updatingHole - 1] - pat;

    this.barChartData[1].data = updatedStrokes;
    this.barChartData[2].data = updatedPats;

  }

  // change which 9 is available when tee has been changed
  teeChange(clearGraph: boolean) {

    // update available holes
    this.tee = this.course.tees.filter((t, i) => t.id === this.f.teeDropDown.value).pop();

    if (this.tee.teeType === 1) {
      this.holeSelectorActive.fill({ disabled: true, active: false}, 9);
      this.holeSelectorActive.fill({ disabled: false}, 0, 9);

    } else if (this.tee.teeType === 2) {
      this.holeSelectorActive.fill({ disabled: true, active: false}, 0, 9);
      this.holeSelectorActive.fill({ disabled: false}, 9);

    } else {
      this.holeSelectorActive.fill({ disabled: false});
    }

    if (clearGraph) {
      this.clearGraph();
    }

    this.calculateResult();
  }

  private clearGraph() {
    // clear graph
    this.putts.fill(0);
    this.barChartData[2].data = this.putts;
    this.strokes.fill(0);
    this.barChartData[1].data = this.strokes;

    // clear strokes and putts
    this.strokeSelectorActive.fill({disabled: false, active: false});
    this.patSelectorActive.fill({disabled: false, active: false});
  }
}
