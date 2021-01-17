import { Component, OnInit } from '@angular/core';
import { AlertService, AuthenticationService } from '@/_services';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Game } from '../_models';
import { GameHttpService } from '../_services';

@Component({
  selector: 'app-bbb-game',
  templateUrl: './bbb-game.component.html',
  styleUrls: ['./bbb-game.component.css']
})
export class BbbGameComponent implements OnInit {

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  loading = false;
  players: number;
  stake: number;
  holes: number[];
  currentHole: number;
  rowResult: number[];
  editResult: number[];
  gameResult: number[][];
  completedStatus: string[];
  editHole: number;
  score: number[];
  playerNicks: string[];
  payment: number[];

  constructor(private gameHttpService: GameHttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.players = history.state.data.playersNo;
      this.stake = history.state.data.stake;
      this.playerNicks = history.state.data.players;
      this.holes = Array(18).fill(0).map((x, i) => i + 1);
      this.currentHole = 1;
      this.rowResult = Array(this.players).fill(0);
      this.editResult = Array(this.players).fill(0);
      this.gameResult = new Array(18).fill(new Array(this.players)).map((x) => x.fill(0));
      this.completedStatus = Array(18).fill('No');
      this.completedStatus[0] = 'Confirm';
      this.editHole = -1;
      this.score = Array(this.players).fill(0);
      this.payment = Array(this.players).fill(0);
    }
  }

  onCompleted(holeIdx: number): void {

    // not allow complete the hole without the winner
    if (this.rowResult.reduce((p, n) => p + n) < 2 || this.rowResult.reduce((p, n) => p + n) > 3) {
      return;
    }

    this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) => this.rowResult[i]);
    // console.log(this.gameResult);
    this.rowResult.fill(0);
    this.completedStatus[holeIdx] = 'Done';

    this.currentHole++;
    if (this.currentHole <= 18) {
      this.completedStatus[holeIdx + 1] = 'Confirm';
    }

    this.calculateScoreAndPayment();
  }

  onEdit(holeIdx: number): void {

    if (this.completedStatus[holeIdx] === 'Edit') {

      // not allow complete the hole without the winner
      if (this.editResult.reduce((p, n) => p + n) < 2 || this.editResult.reduce((p, n) => p + n) > 3) {
        return;
      }
      this.completedStatus[holeIdx] = 'Done';
      this.editHole = -1;
      this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) => this.editResult[i]);
      this.calculateScoreAndPayment();
    } else if (this.editHole === -1) {
      this.editResult = Array(this.players).fill(0).map((x, i) => this.gameResult[holeIdx][i]);
      // console.log(this.editResult);
      this.editHole = holeIdx;
      this.completedStatus[holeIdx] = 'Edit';
    }
  }

  onChangeResult(player: number, hole: number): void {

    let updArray: number[];
    if (this.editHole === hole - 1) {
      updArray = this.editResult;
    } else {
      updArray = this.rowResult;
    }

    // console.log('player: ' + player + ' current result: ' + updArray);

    if (updArray[player] === 3) {
      updArray[player] = 0;
    } else {
      updArray[player]++;
    }
  }

  calculateScoreAndPayment() {
    this.score = Array(this.players).fill(0);
    this.gameResult.forEach((hole) => {
      // update scores
      hole.forEach((x, i) => this.score[i] += x);
    });

    // the best score
    const max = this.score.reduce((p, c) => {
      if (c > p) {
        p = c;
      }
      return p;
    });

    // console.log('max: ' + max);
    // console.log('maxCnt: ' + maxCnt);
    // console.log('score: ' + this.score);

    this.score.forEach((v, i) => {

      if (v === max) {
         this.payment[i] = 0;
         // this.payment[i] = (max - v) * this.stake;
      } else {
        this.payment[i] = (v - max) * this.stake;
      }
    });

    // console.log('payment: ' + this.payment);
  }

  onSave() {

    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to save the game?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.save();
      }
      this.dialogRef = null;
    });
  }

  save() {

    this.loading = true;

    const game: Game = {

      gameId: 2,
      stake: this.stake,
      player: this.authenticationService.currentPlayerValue,
      gameDate: new Date().toISOString(),
      gameData: {
        playerNicks: this.playerNicks,
        score: this.score,
        gameResult: this.gameResult
      }
    };

    this.gameHttpService.addGame(game).subscribe(data => {
      this.alertService.success('The game has been successfully saved', true);
      this.router.navigate(['/']);
    },
      error => {
        this.alertService.error('Saving game failed', true);
        this.loading = false;
        this.router.navigate(['/']);
    });
  }

  onCancel() {

    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to cancel the game?';
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/']);
      }
      this.dialogRef = null;
    });
  }
}
