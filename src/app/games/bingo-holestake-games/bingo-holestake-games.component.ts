import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { AlertService, AuthenticationService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Game } from '../_models';
import { GameHttpService } from '../_services';

@Component({
  selector: 'app-bingo-holestake-games',
  templateUrl: './bingo-holestake-games.component.html',
  styleUrls: ['./bingo-holestake-games.component.css']
})
export class BingoHolestakeGamesComponent implements OnInit {

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
  // 1 - hole stake
  // 2 - bingo bango bongo
  gameType: number;
  gameTile: string;

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
      this.loading = false;
      this.players = history.state.data.playersNo;
      this.stake = history.state.data.stake;
      this.playerNicks = history.state.data.players;
      this.gameType = history.state.data.gameType;
      this.holes = Array(18).fill(0).map((x, i) => i + 1);
      this.currentHole = 1;
      this.completedStatus = Array(18).fill('No');
      this.completedStatus[0] = 'Confirm';
      this.editHole = -1;
      this.score = Array(this.players).fill(0);
      if (this.gameType === 1) {
        this.rowResult = Array(this.players).fill(1);
        this.editResult = Array(this.players).fill(1);
        this.gameResult = new Array(18).fill(new Array(this.players)).map((x) => x.fill(1));
        this.gameTile = 'Hole Stake game - stake:';
      } else {
        this.rowResult = Array(this.players).fill(0);
        this.editResult = Array(this.players).fill(0);
        this.gameResult = new Array(18).fill(new Array(this.players)).map((x) => x.fill(0));
        this.payment = Array(this.players).fill(0);
        this.gameTile = 'Bingo, Bango, Bongo game - stake:';
      }
    }
  }

  onCompleted(holeIdx: number): void {

    if (this.gameType === 1) {
      // not allow complete the hole without the winner
      if  (!this.rowResult.includes(1)) {
        return;
      }
      this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) =>  this.rowResult[i]);
      // console.log(this.gameResult);
      this.rowResult.fill(1);
    } else {
      if (this.rowResult.reduce((p, n) => p + n) < 2 || this.rowResult.reduce((p, n) => p + n) > 3) {
        return;
      }
      this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) => this.rowResult[i]);
      // console.log(this.gameResult);
      this.rowResult.fill(0);
    }

    this.completedStatus[holeIdx] = 'Done';

    this.currentHole++;
    if (this.currentHole <= 18) {
      this.completedStatus[holeIdx + 1] = 'Confirm';
    }

    if (this.gameType === 1) {
      this.calculateScore();
    } else {
      this.calculateScoreAndPayment();
    }
  }

  onEdit(holeIdx: number): void {

    if (this.completedStatus[holeIdx] === 'Edit') {

      if (this.gameType === 1) {

        if  (!this.editResult.includes(1)) {
          return;
        }

      } else {
        // not allow complete the hole without the winner
        if (this.editResult.reduce((p, n) => p + n) < 2 || this.editResult.reduce((p, n) => p + n) > 3) {
          return;
        }
      }


      this.completedStatus[holeIdx] = 'Done';
      this.editHole = -1;
      this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) => this.editResult[i]);
      if (this.gameType === 1) {
        this.calculateScore();
      } else {
        this.calculateScoreAndPayment();
      }
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
    if (this.gameType === 1) {
      if (updArray[player] === this.players) {
        updArray[player] = 1;
      } else {
        updArray[player]++;
      }
    } else {
      if (updArray[player] === 3) {
        updArray[player] = 0;
      } else {
        updArray[player]++;
      }
    }
  }

  calculateScore() {
    this.score = Array(this.players).fill(0);
    this.gameResult.forEach((hole) => {
        // first find number of winners
        let winnersCnt = 0;
        hole.forEach((plScore) => {if (plScore === 1) { winnersCnt++; }});
        let winnerAmt = 0;
        let looserAmt = 0;
        // than calculate winner amount
        if (winnersCnt < this.players) {
          winnerAmt = this.stake / winnersCnt;
        }
        // console.log('winnerAmout: ' + winnerAmt);
        // last calculate looser amount
        if (this.players - winnersCnt > 0) {
          looserAmt = -this.stake / (this.players - winnersCnt);
          // console.log('looserAmout: ' + looserAmt);
        }
        // console.log('core: ' + this.score);
        // update scores
        hole.forEach((x, i) => { if (x === 1) {this.score[i] += winnerAmt; } else {this.score[i] += looserAmt; }});
    });
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

      gameId: this.gameType,
      stake: this.stake,
      player: this.authenticationService.currentPlayerValue,
      gameDate: new Date().toISOString(),
      gameData: {
        playerNicks: this.playerNicks,
        score: this.score,
        gameResult: this.gameResult
      }
    };

    this.gameHttpService.addGame(game).pipe(
      tap(
        () => {
          this.alertService.success('The game has been successfully saved', true);
          this.loading = false;
          this.router.navigate(['/']);
        })
    ).subscribe();
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
