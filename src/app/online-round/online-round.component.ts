import { teeTypes } from './../_models/tee';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { WebSocketAPI } from '@/_helpers/web.socekt.api';
import { Course, Tee } from '@/_models';
import { OnlineRound } from '@/_models/onlineRound';
import { OnlineScoreCard } from '@/_models/onlineScoreCard';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-online-round',
  templateUrl: './online-round.component.html',
  styleUrls: ['./online-round.component.css']
})
export class OnlineRoundComponent implements OnInit, OnDestroy {

  faPlay = faPlay;

  course: Course;
  teeOptions = [];
  public addScorecardForm: FormGroup;
  submitted = false;
  tee: Tee;
  loading = false;
  dialogRef: MatDialogRef<ConfirmationDialogComponent>;
  display = false;
  started = false;
  currentHole = 0;
  currentStroke: number;
  lastPlayed = 0;
  strokes: number[] = Array(18).fill(0);
  round: OnlineRound;
  roundCompleted = false;
  totalStrokes: number;
  // prevStroke: number;
  holes: number[];

  webSocketAPI: WebSocketAPI;

  constructor(private httpService: HttpService,
              private route: ActivatedRoute ,
              private alertService: AlertService,
              private formBuilder: FormBuilder,
              private dialog: MatDialog,
              private authenticationService: AuthenticationService,
              private router: Router) {
    this.totalStrokes = 0;
    this.getRoundData();
    this.webSocketAPI = new WebSocketAPI(null, this.alertService, this.authenticationService);
  }

  ngOnInit(): void {
    this.addScorecardForm = this.formBuilder.group({
      teeTime: ['', [Validators.required, Validators.pattern('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$')]],
      teeDropDown: ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    // console.log('destroy');
    this.webSocketAPI._disconnect();
  }

  getRoundData() {

    // get list of holes and tees and update course object using received data
    combineLatest([this.httpService.getHoles(this.route.snapshot.params.courseId),
    this.httpService.getTees(this.route.snapshot.params.courseId)]).subscribe(([retHoles, retTees]) => {

      this.course = {
        id: this.route.snapshot.params.courseId,
        name: this.route.snapshot.params.courseName,
        par: this.route.snapshot.params.coursePar,
        holes: retHoles,
        tees: retTees
      };

      // console.log('ret holes: ' + this.course.holes);

      // create tee labels
      const teeType = ['1-18', '1-9', '10-18'];
      retTees.forEach((t, i) => this.teeOptions.push({ label: t.tee + ' ' + teeType[t.teeType], value: t.id }));

      // get online round from state in case of edit
      if (history.state.data) {
        this.round = history.state.data.onlineRound;
        this.onEdit();
      }

      this.display = true;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.addScorecardForm.controls; }

  // change which 9 is available when tee has been changed
  teeChange(clearGraph: boolean) {

    // update available holes
    this.tee = this.course.tees.filter((t, i) => t.id === this.f.teeDropDown.value).pop();
  }

  onEdit() {

    // get score cards
    this.httpService.getOnlineScoreCard(this.round.id).subscribe(retScoreCards => {

      retScoreCards.map(scoreCard => this.strokes[scoreCard.hole - 1] = scoreCard.stroke);
      this.totalStrokes = this.strokes.reduce((prev, current) => prev + current);
      // console.log(this.strokes);
      if (retScoreCards.length === 0) {
        this.currentHole = 0;
      } else {
        this.currentHole = retScoreCards.map(scoreCard => scoreCard.hole).reduce((p, c) => p < c ? c : p) - 1;
      }
      // console.log(this.currentHole);
      this.lastPlayed = this.currentHole + 1;
      this.currentStroke = this.course.holes[this.currentHole].par;

      this.tee = this.round.tee;

      // check if round not completed
      if ((this.tee.teeType === teeTypes.TEE_TYPE_FIRST_9 && this.currentHole === 8) || this.currentHole === 17)  {
        this.roundCompleted = true;
      }

      if (!this.roundCompleted) {
        this.currentHole++;
      }

      switch (this.tee.teeType) {
        case teeTypes.TEE_TYPE_18:
          // console.log(new Array(18).fill(0).map((x, i) => x + i));
          this.holes = new Array(18).fill(0).map((x, i) => x + i);
          break;
        case teeTypes.TEE_TYPE_FIRST_9:
          this.holes = new Array(9).fill(0).map((x, i) => x + i);
          break;
        default:
          // console.log(new Array(9).fill(0).map((x, i) => x + i + 9));
          this.holes = new Array(9).fill(0).map((x, i) => x + i + 9);
          break;
      }
      // console.log(this.holes);
      this.webSocketAPI._connect(false);

      // console.log(this.course.holes);
      this.started = true;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.error.message, false);
      });
  }

  onStart() {

    this.submitted = true;
    if (this.addScorecardForm.invalid) {
      return;
    }

    // display dialog box for saving confirmation
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to start the round?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // save if accepted by player
        this.loading = true;
        this.webSocketAPI._connect(false);

        const onlineRound: OnlineRound = {
          course: this.course,
          teeTime: this.f.teeTime.value,
          player: this.authenticationService.currentPlayerValue,
          tee: this.course.tees.filter((t, i) => t.id === this.f.teeDropDown.value).pop()
        };

        this.httpService.addOnlineRound(onlineRound).subscribe(round => {
          // console.log('online round started');

          this.round = round;

          // update for last 9 round
          if (this.tee.teeType === teeTypes.TEE_TYPE_LAST_9) {
            this.currentHole = 9;
            this.currentStroke = this.course.holes[9].par;
          } else {
            this.currentStroke = this.course.holes[0].par;
          }

          switch (this.tee.teeType) {
            case teeTypes.TEE_TYPE_18:
              // console.log(new Array(18).fill(0).map((x, i) => x + i));
              this.holes = new Array(18).fill(0).map((x, i) => x + i);
              break;
            case teeTypes.TEE_TYPE_FIRST_9:
              this.holes = new Array(9).fill(0).map((x, i) => x + i);
              break;
            default:
              // console.log(new Array(9).fill(0).map((x, i) => x + i + 9));
              this.holes = new Array(9).fill(0).map((x, i) => x + i + 9);
              break;
          }

          this.started = true;
        },
          (error: HttpErrorResponse) => {
            // console.log(error.error.message);
            this.alertService.error(error.error.message, true);
            this.loading = false;
            this.webSocketAPI._disconnect();
          });

        this.loading = false;

      }
      // do nothing if not
      this.dialogRef = null;
    });
  }

  addScore() {

    // create new online score card
    const currentOnlineScoreCard: OnlineScoreCard = {
      hole: this.currentHole + 1,
      stroke: this.currentStroke,
      player: {
        id: this.authenticationService.currentPlayerValue.id
      },
      onlineRoundId: this.round.id,
      update: false
    };

    // verify if it is update
    if (this.lastPlayed > this.currentHole) {
      currentOnlineScoreCard.update = true;
    // or new scorecard
    } else {
      // this.prevStroke = this.strokes[this.currentHole];
      if (!this.roundCompleted) {
        this.lastPlayed++;
      }
    }

    // save only if anything has been changes
    if (this.currentStroke !== this.strokes[this.currentHole]) {
      // send scorecard to server
      this.webSocketAPI._send(currentOnlineScoreCard);
      // update total strokes by substracting current value and adding the new one
      this.totalStrokes -= this.strokes[this.currentHole];
      this.totalStrokes += this.currentStroke;
    }

    // update stroke list
    this.strokes[this.currentHole] = this.currentStroke;

    // console.log('current hole: ' + this.currentHole);
    if ((this.tee.teeType === teeTypes.TEE_TYPE_FIRST_9 && this.currentHole === 8) || this.currentHole === 17) {
      this.roundCompleted = true;
    }

    // update current hole if round is not completed
    if (!this.roundCompleted) {
      this.currentHole = this.lastPlayed;
      this.currentStroke = this.course.holes[this.currentHole].par;
    }
  }

  onDelete() {

    // display dialog box for verification if the user for sure want to delete the scorecard
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this scorecard permanently?';
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loading = true;

        this.httpService.deleteOnlineRound(this.round.id).subscribe(onlineRoundId => {
          // console.log('deleted course id: ' + onlineRoundId);
          this.alertService.success('This score card has been successfully deleted', false);

        },
          (error: HttpErrorResponse) => {
            this.alertService.error('Deleting the score card failed', true);
            this.loading = false;
          });
        this.router.navigate(['/']);
      }
      // do nothing if not
      this.dialogRef = null;
    });
  }

  onFinal() {

    // display dialog box for verification if the user for sure want to finalize the round
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to finish the round?';
    this.dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.loading = true;

        this.httpService.finalizeOnlineRound(this.round.id).subscribe(round => {
          // console.log('deleted course id: ' + onlineRoundId);
          this.alertService.success('The round has been successfuly saved', false);

        },
          (error: HttpErrorResponse) => {
            this.alertService.error('Saving the round failed', true);
            this.loading = false;
          });
        this.router.navigate(['/']);
      }
      // do nothing if not
      this.dialogRef = null;
    });

  }

  onDecrease() {

    // number of strokes canot be lower than 1
    if (this.currentStroke === 1) {
      return;
    }
    this.currentStroke--;

  }

  onUpdate(hole: number) {
    // console.log('hole: ' + hole);
    // console.log('last played: ' + this.lastPlayed);
    this.currentHole = hole;
    // console.log(this.strokes);
    this.currentStroke = this.strokes[hole];
  }

  onIncrease() {

    // number of strokes canot be greater than 15
    if (this.currentStroke === 15) {
      return;
    }
    // this.strokes[this.currentHole]++;
    this.currentStroke++;
  }
}
