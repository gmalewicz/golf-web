import { Component, OnInit} from '@angular/core';
import { AlertService, AuthenticationService } from '@/_services';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Game } from '../_models';
import { GameHttpService } from '../_services';


@Component({
  selector: 'app-hole-stake-game',
  templateUrl: './hole-stake-game.component.html',
  styleUrls: ['./hole-stake-game.component.css']
})
export class HoleStakeGameComponent implements OnInit {

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  loading: boolean;
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
      this.holes = Array(18).fill(0).map((x, i) => i + 1);
      this.currentHole = 1;
      this.rowResult = Array(this.players).fill(1);
      this.editResult = Array(this.players).fill(1);
      this.gameResult =  new Array(18).fill(new Array(this.players)).map((x) => x.fill(1));
      this.completedStatus = Array(18).fill('No');
      this.completedStatus[0] = 'Confirm';
      this.editHole = -1;
      this.score = Array(this.players).fill(0);

      // console.log(this.gameResult);
      // console.log('players: ' + this.players + ' stake: ' + this.stake);
    }
  }

  onCompleted(holeIdx: number): void {

    // not allow complete the hole without the winner
    if  (!this.rowResult.includes(1)) {
      return;
    }

    this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) =>  this.rowResult[i]);
    // console.log(this.gameResult);
    this.rowResult.fill(1);
    this.completedStatus[holeIdx] = 'Done';

    this.currentHole++;
    if (this.currentHole <= 18) {
      this.completedStatus[holeIdx + 1] = 'Confirm';
    }

    this.calculateScore();
  }

  onEdit(holeIdx: number): void {

    if (this.completedStatus[holeIdx] === 'Edit') {

      // not allow complete the hole without the winner
      if  (!this.editResult.includes(1)) {
        return;
      }
      this.completedStatus[holeIdx] = 'Done';
      this.editHole = -1;
      this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) =>  this.editResult[i]);
      this.calculateScore();
    } else if (this.editHole === -1) {
      this.editResult = Array(this.players).fill(0).map((x, i) =>  this.gameResult[holeIdx][i]);
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

    if (updArray[player] === this.players) {
      updArray[player] = 1;
    } else {
      updArray[player]++;
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
        // update scores
        hole.map((x, i) => { if (x === 1) {this.score[i] += winnerAmt; } else {this.score[i] += looserAmt; }});
    });
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

      gameId: 1,
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