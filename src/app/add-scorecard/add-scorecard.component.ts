import { Component, OnInit, viewChild, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { HttpService } from '../_services/http.service';
import { TournamentHttpService } from '@/tournament/_services/tournamentHttp.service';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import { Course, ScoreCard, Round, Tee, TeeOptions, Format } from '@/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, AlertService } from '@/_services';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { combineLatest } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { getDateAndTime } from '@/_helpers/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatError, MatLabel } from '@angular/material/form-field';
import { NgClass } from '@angular/common';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';

interface TournamentEditContext {
  tournamentResultId: number;
  tournamentId: number;
  playerId: number;
  playerSex: boolean;
}

@Component({
    selector: 'app-add-scorecard',
    templateUrl: './add-scorecard.component.html',
    styleUrl: './add-scorecard.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule,
              MatFormField,
              MatInput,
              MatError,
              MatLabel,
              MatSelect,
              MatOption,
              BaseChartDirective,
              NgClass,
              LoadingDirective]
})
export class AddScorecardComponent implements OnInit {
  private readonly httpService = inject(HttpService);
  private readonly tournamentHttpService = inject(TournamentHttpService);
  private readonly route = inject(ActivatedRoute);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly dialog = inject(MatDialog);

  chart = viewChild(BaseChartDirective);

  // ── non-reactive internal state ────────────────────────────────────────────
  dialogRef: MatDialogRef<ConfirmationDialogComponent> | null = null;
  tournamentEdit: TournamentEditContext | null = null;
  submitted = false;
  tee!: Tee;
  first9Par!: number;
  updatingHole = 0;
  strokes: number[] = [];
  putts: number[] = [];

  // ── constant fields (never change after init) ───────────────────────────────
  readonly barChartType: ChartType = 'bar';
  readonly barChartLegend = true;
  readonly strokeButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  readonly patButtons = [0, 1, 2, 3, 4, 5];

  // ── signals ─────────────────────────────────────────────────────────────────
  round = signal<Round | null>(null);
  course = signal<Course | null>(null);
  loading = signal(false);
  display = signal(false);
  displayResult = signal('');
  teeOptions = signal<TeeOptions[]>([]);
  barChartLabels = signal<number[]>([]);
  barChartData = signal<ChartDataset[]>([]);
  barChartOptions = signal<ChartOptions>({} as ChartOptions);
  holeSelectorActive = signal<HoleSelector[]>(new Array(18).fill({ disabled: true, active: false }));
  strokeSelectorActive = signal<HoleSelector[]>(new Array(16).fill({ disabled: true, active: false }));
  patSelectorActive = signal<HoleSelector[]>(new Array(6).fill({ disabled: true, active: false }));

  public addScorecardForm!: FormGroup;

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {

      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      const dateStr = getDateAndTime();

      this.addScorecardForm = this.formBuilder.group({
        date: [dateStr[0], [Validators.required, Validators.pattern('([0-9]{4})/([0-9]{1,2})/([0-9]{1,2})')]],
        teeTime: [dateStr[1], [Validators.required, Validators.pattern('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$')]],
        teeDropDown: ['', [Validators.required]]
      });

      // get round from state in case of edit
      if (history.state.data) {
        this.round.set(history.state.data.round);
        this.tournamentEdit = history.state.data.tournamentEdit ?? null;
      }

      this.getRoundData();
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.addScorecardForm.controls; }

  generateLabelsAndData() {

    const barData: number[] = [];
    const newLabels: number[] = [];
    const updatedPats: number[] = [];
    const updatedStrokes: number[] = [];
    const course = this.course()!;
    const round = this.round();

    this.strokes = [];
    this.putts = [];

    for (let hole = 1; hole <= 18; hole++) {
      newLabels.push(hole);
      barData.push(course.holes![hole - 1].par);
      // in case of edit score card
      if (round == null) {
        this.strokes.push(0);
        this.putts.push(0);
      } else {
        this.strokes.push(round.scoreCard![hole - 1].stroke);
        this.putts.push(round.scoreCard![hole - 1].pats);
        updatedPats.push(this.putts[hole - 1]);
        updatedStrokes.push(this.strokes[hole - 1] - this.putts[hole - 1]);
      }
    }

    this.barChartLabels.set(newLabels);

    const newChartData: ChartDataset[] = [
      { stack: 'Stack 0', label: 'Par', data: barData, backgroundColor: 'purple', borderWidth: 1 },
      { stack: 'Stack 1', label: $localize`:@@addScorecard-strokesChrt:Strokes`,
        data: [...this.strokes], backgroundColor: 'red', borderWidth: 1 },
      { stack: 'Stack 1', label: $localize`:@@addScorecard-puttsChrt:Putts`,
        data: [...this.putts], backgroundColor: 'blue', borderWidth: 1 }
    ];

    if (round != null) {
      newChartData[1].data = updatedStrokes;
      newChartData[2].data = updatedPats;
      this.f.date.setValue(round.roundDate.substring(0, 10));
      this.f.date.disable();
      this.f.teeTime.setValue(round.roundDate.substring(11, 16));
      this.f.teeTime.disable();

      // get tee which was played
      const detailsPlayerId = this.tournamentEdit
        ? this.tournamentEdit.playerId
        : this.authenticationService.currentPlayerValue!.id!;
      this.httpService.getPlayerRoundDetails(detailsPlayerId, round.id!).pipe(tap(
        (playerRoundDetails) => {
          this.f.teeDropDown.setValue(playerRoundDetails.teeId);
          // update availability of holes, strokes and putts
          this.teeChange(false);
        })
      ).subscribe();
    }

    this.barChartData.set(newChartData);

    this.barChartOptions.set({
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1 }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: (tooltipItem: { label: string; }[]) =>
              $localize`:@@addScorecard-holeChrt:Hole: ` + tooltipItem[0].label
          }
        }
      }
    });
  }

  getRoundData() {

    // get list of holes and tees and update course object using received data
    combineLatest([
      this.httpService.getHoles(this.route.snapshot.params.courseId),
      this.httpService.getTees(this.route.snapshot.params.courseId)
    ]).pipe(tap(([retHoles, retTees]) => {

      this.course.set({
        id: this.route.snapshot.params.courseId,
        name: this.route.snapshot.params.courseName,
        par: this.route.snapshot.params.coursePar,
        holes: retHoles,
        tees: retTees
      });

      this.first9Par = this.course()!.holes!
        .filter((h) => { if (h.number <= 9) { return h.par; } })
        .map(h => h.par)
        .reduce((p, c) => p + c, 0);

      // create tee labels
      const teeType = ['1-18', '1-9', '10-18'];
      const playerSex = this.tournamentEdit
        ? this.tournamentEdit.playerSex
        : this.authenticationService.currentPlayerValue.sex;
      const newTeeOptions: TeeOptions[] = [];
      retTees.filter(t => t.sex === playerSex).forEach((t) =>
        newTeeOptions.push({ label: t.tee + ' ' + teeType[t.teeType!], value: t.id! }));
      this.teeOptions.set(newTeeOptions);

      this.generateLabelsAndData();
      this.display.set(true);
    })).subscribe();
  }

  clear() {

    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, { disableClose: false });
    this.dialogRef.componentInstance.confirmMessage =
      $localize`:@@addScorecard-clearConf:Are you sure you want to clear score card?`;
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.holeSelectorActive.update(arr => arr.map(() => ({ active: false })));
        this.clearGraph();
        this.displayResult.set('');
      }
      this.dialogRef = null;
    });
  }

  onSubmit() {

    // display dialog box for saving confirmation
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, { disableClose: false });
    this.dialogRef.componentInstance.confirmMessage =
      $localize`:@@addScorecard-saveConf:Are you sure you want to save score card?`;
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
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, { disableClose: false });
    this.dialogRef.componentInstance.confirmMessage =
      $localize`:@@addScorecard-cancelConf:Are you sure you want to exit?`;
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // go to main page if cancel
        this.router.navigate(['/home']).catch(error => console.log(error));
      }
      // do nothing if not
      this.dialogRef = null;
    });
  }

  save() {

    this.submitted = true;

    if (this.addScorecardForm.invalid) {
      return;
    }

    this.loading.set(true);

    const scoreCard: ScoreCard[] = [];
    const round = this.round();

    for (let hole = 0; hole < 18; hole++) {

      if (round == null) {
        scoreCard.push({ hole: hole + 1, stroke: this.strokes[hole], pats: this.putts[hole], penalty: 0 });
      } else {
        round.scoreCard![hole].stroke = this.strokes[hole];
        round.scoreCard![hole].pats = this.putts[hole];
      }
    }

    if (round == null) {

      const newRound: Round = {
        course: this.course()!,
        roundDate: this.f.date.value + ' ' + this.f.teeTime.value,
        // prepare player with only required data
        player: [{ id: this.authenticationService.currentPlayerValue.id, whs: this.authenticationService.currentPlayerValue.whs }],
        scoreCard,
        format: Format.STROKE_PLAY
      };
      // only selected tee shall be sent, so replace entire list with selected tee
      newRound.course.tees = newRound.course.tees!.filter(t => t.id === this.f.teeDropDown.value);
      // remove holes from the course not to send data to backend
      newRound.course.holes = undefined;

      this.httpService.addRound(newRound).pipe(tap(() => {
        this.display.set(false);
        this.alertService.success(
          $localize`:@@addScorecard-successConf:The round at ${this.f.date.value} ${this.f.teeTime.value} successfully added`,
          true);
        this.router.navigate(['/home']).catch(error => console.log(error));
      })).subscribe();
    } else {
      round.roundDate = this.f.date.value + ' ' + this.f.teeTime.value;
      round.teeId = this.f.teeDropDown.value;

      if (this.tournamentEdit) {
        const ctx = this.tournamentEdit;
        this.httpService.updateRound(round).pipe(
          switchMap(() => this.tournamentHttpService.deleteRound(ctx.tournamentResultId, round.id!)),
          switchMap(() => this.tournamentHttpService.addRoundToTournament(round, ctx.tournamentId, ctx.playerId)),
          tap(() => {
            this.display.set(false);
            this.alertService.success(
              $localize`:@@addScorecard-addConf:The round at ${this.f.date.value} ${this.f.teeTime.value} successfully updated`,
              true);
            this.router.navigate(['/tournaments/tournamentResults']).catch(error => console.log(error));
          })
        ).subscribe();
      } else {
        this.httpService.updateRound(round).pipe(tap(() => {
          this.display.set(false);
          this.alertService.success(
            $localize`:@@addScorecard-addConf:The round at ${this.f.date.value} ${this.f.teeTime.value} successfully updated`,
            true);
          this.router.navigate(['/home']).catch(error => console.log(error));
        })).subscribe();
      }
    }
  }

  selectHole(hole: number) {

    // initialize buttons and set them not to be marked
    const holeArr = new Array(18).fill({ active: false });
    holeArr[hole - 1] = { active: true };
    this.holeSelectorActive.set(holeArr);

    this.updatingHole = hole;

    const strokeArr = this.strokeSelectorActive().map(() => ({ active: false }));
    if (this.strokes[hole - 1] > 0) {
      strokeArr[this.strokes[hole - 1] - 1] = { active: true };
    }
    this.strokeSelectorActive.set(strokeArr);

    const patArr = this.patSelectorActive().map(() => ({ active: false }));
    if (this.putts[hole - 1] > 0) {
      patArr[this.putts[hole - 1]] = { active: true };
    }
    // to highlight 0 putts
    if (this.putts[hole - 1] === 0 && this.strokes[hole - 1] > 0) {
      patArr[this.putts[hole - 1]] = { active: true };
    }
    this.patSelectorActive.set(patArr);
  }

  selectStroke(stroke: number) {

    // number of pats cannot be greater than number of strokes
    if (stroke < this.putts[this.updatingHole - 1]) {
      this.alertService.error(
        $localize`:@@addScorecard-puttTooHigh:Number of putts cannot be greater than number of strokes`,
        false);
      return;
    }

    // initialize buttons and set them not to be marked
    const newStrokeArr = new Array(18).fill({ active: false });
    newStrokeArr[stroke - 1] = { active: true };
    this.strokeSelectorActive.set(newStrokeArr);

    const updatedStrokes: number[] = [];
    for (let hole = 0; hole < 18; hole++) {
      updatedStrokes.push(this.strokes[hole] - this.putts[hole]);
    }
    this.strokes[this.updatingHole - 1] = stroke;
    updatedStrokes[this.updatingHole - 1] = stroke - this.putts[this.updatingHole - 1];

    this.barChartData.update(data => {
      const newData = [...data];
      newData[1] = { ...newData[1], data: updatedStrokes };
      return newData;
    });

    this.calculateResult();
    this.chart()?.chart?.update();
  }

  private calculateResult() {

    const result = this.strokes.reduce((p, c) => p + c, 0);
    let difference: number;
    let par: number;
    const course = this.course()!;

    if (this.tee.teeType === 1) {
      difference = result - this.first9Par;
      par = this.first9Par;
    } else if (this.tee.teeType === 2) {
      difference = result - course.par + this.first9Par;
      par = course.par - this.first9Par;
    } else {
      difference = result - course.par;
      par = course.par;
    }

    const differenceStr = difference > 0 ? '+' + difference : '' + difference;
    this.displayResult.set(result + '/' + par + ' (' + differenceStr + ')');
  }

  selectPat(pat: number) {

    // number of pats cannot be greater than number of strokes
    if (pat > this.strokes[this.updatingHole - 1]) {
      this.alertService.error(
        $localize`:@@addScorecard-puttsHigherStrokes:Number of putts cannot be greater than number of strokes`,
        false);
      return;
    }

    // initialize buttons and set them not to be marked
    const newPatArr = new Array(18).fill({ active: false });
    newPatArr[pat] = { active: true };
    this.patSelectorActive.set(newPatArr);

    const updatedPats: number[] = [];
    const updatedStrokes: number[] = [];
    for (let hole = 0; hole < 18; hole++) {
      updatedPats.push(this.putts[hole]);
      updatedStrokes.push(this.strokes[hole] - this.putts[hole]);
    }
    this.putts[this.updatingHole - 1] = pat;
    updatedPats[this.updatingHole - 1] = pat;
    // display pressed button until another hole button is pressed
    updatedStrokes[this.updatingHole - 1] = this.strokes[this.updatingHole - 1] - pat;

    this.barChartData.update(data => {
      const newData = [...data];
      newData[1] = { ...newData[1], data: updatedStrokes };
      newData[2] = { ...newData[2], data: updatedPats };
      return newData;
    });

    this.chart()?.chart?.update();
  }

  // change which 9 is available when tee has been changed
  teeChange(clearGraph: boolean) {

    // update available holes
    this.tee = this.course()!.tees!.findLast(t => t.id === this.f.teeDropDown.value)!;

    const holeSel = [...this.holeSelectorActive()];
    if (this.tee.teeType === 1) {
      holeSel.fill({ disabled: true, active: false }, 9);
      holeSel.fill({ disabled: false }, 0, 9);
    } else if (this.tee.teeType === 2) {
      holeSel.fill({ disabled: true, active: false }, 0, 9);
      holeSel.fill({ disabled: false }, 9);
    } else {
      holeSel.fill({ disabled: false });
    }
    this.holeSelectorActive.set(holeSel);

    if (clearGraph) {
      this.clearGraph();
    }

    this.calculateResult();
  }

  private clearGraph() {
    // clear graph
    this.putts.fill(0);
    this.strokes.fill(0);

    this.barChartData.update(data => {
      const newData = [...data];
      newData[1] = { ...newData[1], data: [...this.strokes] };
      newData[2] = { ...newData[2], data: [...this.putts] };
      return newData;
    });
    this.chart()?.chart?.update();

    // clear strokes and putts selectors
    this.strokeSelectorActive.set(
      new Array(this.strokeSelectorActive().length).fill({ disabled: false, active: false }));
    this.patSelectorActive.set(
      new Array(this.patSelectorActive().length).fill({ disabled: false, active: false }));
  }
}

interface HoleSelector {
  disabled?: boolean;
  active?: boolean;
}
