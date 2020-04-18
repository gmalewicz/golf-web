import { Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hole-stake-game',
  templateUrl: './hole-stake-game.component.html',
  styleUrls: ['./hole-stake-game.component.css']
})
export class HoleStakeGameComponent implements OnInit {

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

  constructor( private route: ActivatedRoute) {

    this.players = +this.route.snapshot.params.players;
    this.stake = this.route.snapshot.params.stake;
    this.holes = Array(18).fill(0).map((x, i) => i + 1);
    this.currentHole = 1;
    this.rowResult = Array(this.players).fill(1);
    this.editResult = Array(this.players).fill(1);
    this.gameResult =  new Array(18).fill(new Array(this.players)).map((x) => x.fill(1));
    this.completedStatus = Array(18).fill('No');
    this.completedStatus[0] = 'Confirm';
    this.editHole = -1;
    this.score = Array(4).fill(0);

    console.log(this.gameResult);
    console.log('players: ' + this.players + ' stake: ' + this.stake);
  }

  ngOnInit(): void {
  }

  onCompleted(holeIdx: number): void {
    this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) =>  this.rowResult[i]);
    console.log(this.gameResult);
    this.rowResult.fill(1);
    this.completedStatus[holeIdx] = 'Done';

    this.currentHole++;
    if (this.currentHole < 18) {
      this.completedStatus[holeIdx + 1] = 'Confirm';
    }

    this.calculateScore();
  }

  onEdit(holeIdx: number): void {

    if (this.completedStatus[holeIdx] === 'Edit') {
      this.completedStatus[holeIdx] = 'Done';
      this.editHole = -1;
      this.gameResult[holeIdx] = Array(4).fill(0).map((x, i) =>  this.editResult[i]);
      this.calculateScore();
    } else if (this.editHole === -1) {
      this.editResult = Array(this.players).fill(0).map((x, i) =>  this.gameResult[holeIdx][i]);
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

    if (updArray[player] === this.players) {
      updArray[player] = 1;
    } else {
      updArray[player]++;
    }
  }

  calculateScore() {
    this.score = Array(4).fill(0);
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
        console.log('winnerAmout: ' + winnerAmt);
        // last calculate looser amount
        if (this.players - winnersCnt > 0) {
          looserAmt = -this.stake / (this.players - winnersCnt);
          console.log('looserAmout: ' + looserAmt);
        }
        // update scores
        hole.map((x, i) => { if (x === 1) {this.score[i] += winnerAmt; } else {this.score[i] += looserAmt; }});
    });
  }
}
