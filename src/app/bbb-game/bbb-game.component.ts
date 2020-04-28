import { Component, OnInit } from '@angular/core';
import { GameService, HttpService, AlertService, AuthenticationService } from '@/_services';
import { Router } from '@angular/router';
import { Game } from '@/_models';

@Component({
  selector: 'app-bbb-game',
  templateUrl: './bbb-game.component.html',
  styleUrls: ['./bbb-game.component.css']
})
export class BbbGameComponent implements OnInit {

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

  constructor(private gameSetupService: GameService,
              private httpService: HttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) {

    this.players = gameSetupService.getGameSetup().playersNo;
    this.stake = gameSetupService.getGameSetup().stake;
    this.playerNicks = gameSetupService.getGameSetup().players;
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

    console.log(this.gameResult);
    console.log('players: ' + this.players + ' stake: ' + this.stake);
  }

  ngOnInit(): void {
  }

  onCompleted(holeIdx: number): void {

    // not allow complete the hole without the winner
    if (this.rowResult.reduce((p, n) => p + n) < 2 || this.rowResult.reduce((p, n) => p + n) > 3) {
      return;
    }

    this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) => this.rowResult[i]);
    console.log(this.gameResult);
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
      console.log(this.editResult);
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

    console.log('player: ' + player + ' current result: ' + updArray);

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
      hole.map((x, i) => this.score[i] += x);
    });

    // the best score
    const max = this.score.reduce((p, c) => {
      if (c > p) {
        p = c;
      }
      return p;
    });
    // how many the best score
    const maxCnt = this.score.reduce((p, c) => {
      if (c >= max) {
        p++;
      }
      return p;
    }, 0);

    console.log('max: ' + max);
    console.log('maxCnt: ' + maxCnt);
    console.log('score: ' + this.score);

    this.score.forEach((v, i) => {

      if (v === max) {
         this.payment[i] = 0;
         // this.payment[i] = (max - v) * this.stake;
      } else {
        this.payment[i] = (v - max) * this.stake;
      }
    });
  }

  save() {

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

    this.httpService.addGame(game).subscribe(data => {
      this.alertService.success('The game has been successfully saved', true);
      this.router.navigate(['/']);
    },
      error => {
        this.alertService.error('Saving game failed', true);
        this.router.navigate(['/']);
    });

  }
}
