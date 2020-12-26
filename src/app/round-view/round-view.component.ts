import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Round, Player } from '@/_models';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChartType, ChartDataSets, ChartOptions } from 'chart.js';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-round-view',
  templateUrl: './round-view.component.html',
  styleUrls: ['./round-view.component.css']
})
export class RoundViewComponent implements OnInit {

  @Input() round: Round;

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  loading: boolean;
  display: boolean;
  // round: Round;
  public barChartType: ChartType;
  public barChartLegend: boolean;
  public barChartLabels: number[];
  public barChartData: ChartDataSets[];
  public barChartOptions: ChartOptions;

  strokes: Array<Array<number>>;
  pats: Array<Array<number>>;
  par: number[];

  players: Player[];

  dipslayPlayers: boolean[];
  dipslayPlayerResult: string[];

  // 0 - full, 1 - first, 2 - second
  display9: number;

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private router: Router,
              private authenticationService: AuthenticationService,
              public dialog: MatDialog) {

  }

  ngOnInit(): void {

    this.display9 = 0;
    this.players = [];
    this.dipslayPlayers = [false, false, false, false];
    this.dipslayPlayerResult = ['0/0', '0/0', '0/0', '0/0'];
    this.strokes = [];
    this.pats = [];
    this.par = [];
    this.barChartType = 'bar';
    this.barChartLegend = true;
    this.barChartLabels = [];
    this.loading = false;
    this.display = false;
    this.showRound();
  }

  showRound() {

    // console.log('strokes: ' + this.strokes);
    // console.log('pats: ' + this.pats);
    // console.log('par: ' + this.par);

    this.httpService.getHoles(this.round.course.id).pipe(tap(
      (retHoles) => {

        this.round.course.holes = retHoles;
        this.players = this.round.player;
        this.dipslayPlayers.fill(true, 0, this.round.player.length);

        this.generateLabelsAndData(1, 18);
        this.generateRoundResults();
        this.display = true;
      })
    ).subscribe();
  }

  generateLabelsAndData(startHole: number, endHole: number) {

    for (let score = 0; score < this.round.scoreCard.length; score++) {

      if (score % 18 === 0) {
        // console.log('create set');
        this.strokes.push([]);
        this.pats.push([]);
      }
      // include first 9
      if (startHole === 1 && Math.floor(score / 9) % 2 === 0) {
        // console.log('first 9: ' + score);
        this.strokes[Math.floor(score / 18)].push(this.round.scoreCard[score].stroke - this.round.scoreCard[score].pats);
        this.pats[Math.floor(score / 18)].push(this.round.scoreCard[score].pats);
      }
      // include second 9
      if (endHole === 18 && Math.floor(score / 9) % 2 === 1) {
        // console.log('second 9: ' + score);
        this.strokes[Math.floor(score / 18)].push(this.round.scoreCard[score].stroke - this.round.scoreCard[score].pats);
        this.pats[Math.floor(score / 18)].push(this.round.scoreCard[score].pats);
      }

    }

    // console.log(this.holes);
    for (let hole = startHole - 1; hole < endHole; hole++) {
      this.par.push(this.round.course.holes[hole].par);
      this.barChartLabels.push(hole + 1);
    }

    // console.log(this.strokes);
    // console.log(this.strokes);
    this.barChartData = [{ stack: 'Stack 0', label: 'Par', data: this.par, backgroundColor: 'purple', borderWidth: 1 }];
    // console.log(this.strokes.length);
    if (this.strokes.length > 0 && this.dipslayPlayers[0]) {
      this.barChartData.push({
        stack: 'Stack 1', label: 'S(' + this.players[0].nick + ')',
        data: this.strokes[0], backgroundColor: '#F99B20', borderWidth: 1
      });
      this.barChartData.push({ stack: 'Stack 1', label: 'Putts', data: this.pats[0], backgroundColor: '#CC7E1A', borderWidth: 1 });
    }
    if (this.strokes.length > 1 && this.dipslayPlayers[1]) {
      this.barChartData.push({
        stack: 'Stack 2', label: 'S(' + this.players[1].nick + ')',
        data: this.strokes[1], backgroundColor: '#51E21D', borderWidth: 1
      });
      this.barChartData.push({ stack: 'Stack 2', label: 'Putts', data: this.pats[1], backgroundColor: '#44BE18', borderWidth: 1 });
    }
    if (this.strokes.length > 2 && this.dipslayPlayers[2]) {
      this.barChartData.push({
        stack: 'Stack 3', label: 'S(' + this.players[2].nick + ')',
        data: this.strokes[2], backgroundColor: '#371BEB', borderWidth: 1
      });
      this.barChartData.push({ stack: 'Stack 3', label: 'Putts', data: this.pats[2], backgroundColor: '#2F18C7', borderWidth: 1 });
    }
    if (this.strokes.length > 3 && this.dipslayPlayers[3]) {
      this.barChartData.push({
        stack: 'Stack 4', label: 'S(' + this.players[3].nick + ')',
        data: this.strokes[3], backgroundColor: '#F22F70', borderWidth: 1
      });
      this.barChartData.push({ stack: 'Stack 4', label: 'Putts', data: this.pats[3], backgroundColor: '#AE6980', borderWidth: 1 });
    }

    // console.log(this.barChartLabels);
    // console.log(this.barChartData);

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

  onDelete() {
    // console.log('delete executed');
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete score card?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do confirmation actions

        this.loading = true;

        this.httpService.deleteScoreCard(this.authenticationService.currentPlayerValue.id, this.round.id).subscribe(roundId => {

          // console.log('deleted scorecard for round id: ' + roundId);
          this.alertService.success('The scorecard has been successfully deleted', false);

        },
          (error: HttpErrorResponse) => {
            this.alertService.error('Deleting the scorecard failed', false);
            this.loading = false;
          });
        this.router.navigate(['/']);
      }
      this.dialogRef = null;
    });
  }

  onFirst9() {

    this.display9 = 1;
    this.clearChartData();
    this.generateLabelsAndData(1, 9);
    this.generateRoundResults();
  }

  onLast9() {

    this.display9 = 2;
    this.clearChartData();
    this.generateLabelsAndData(10, 18);
    this.generateRoundResults();
  }

  onBoth9() {

    this.display9 = 0;
    this.clearChartData();
    this.generateLabelsAndData(1, 18);
    this.generateRoundResults();
  }

  generateRoundResults() {

    const displayPar = this.par.reduce((p, c) => p + c);

    this.players.forEach((player, i) => {

      let stroke = this.strokes[i].reduce((p, c) => p + c);

      stroke += this.pats[i].reduce((p, c) => p + c);

      const difference = stroke - displayPar;

      let differenceStr = '' + difference;
      if (difference > 0) {
        differenceStr = '+' + difference;
      }

      this.dipslayPlayerResult[i] = stroke + '/' + displayPar + ' (' + differenceStr + ')';
    });
  }

  clearChartData() {

    this.barChartLabels = [];
    this.barChartData = [];
    this.barChartOptions = {};

    this.strokes = [];
    this.pats = [];
    this.par = [];
  }

  onChecked($event, playerIdx) {
    // console.log($event.target.checked); // {}, true || false
    // console.log($event); // {}, true || false

    this.dipslayPlayers[playerIdx] = $event.target.checked;

    if (this.display9 === 0) {
      this.onBoth9();
    } else if (this.display9 === 1) {
      this.onFirst9();
    } else {
      this.onLast9();
    }

  }
}
