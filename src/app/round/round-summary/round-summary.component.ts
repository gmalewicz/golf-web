import { ballPickedUpStrokes } from '@/_helpers/common';
import { Round } from '@/_models/round';
import { Component, Input, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-round-summary',
    templateUrl: './round-summary.component.html',
    standalone: true,
    imports: [NgIf, NgFor, DecimalPipe]
})
export class RoundSummaryComponent implements OnInit {

  @Input() round: Round;

  score: number[];
  netScore: number[];
  corScore: number[];
  stbNet: number[];
  stbGross: number[];
  putts: number[];
  penalties: number[];

  ballPickedUp: boolean[];

  display: boolean;

  ngOnInit(): void {

    this.display = false;

    this.score = Array(this.round.player.length).fill(0);
    this.netScore = Array(this.round.player.length).fill(0);
    this.corScore = Array(this.round.player.length).fill(0);
    this.stbNet = Array(this.round.player.length).fill(0);
    this.stbGross = Array(this.round.player.length).fill(0);
    this.putts = Array(this.round.player.length).fill(0);
    this.penalties = Array(this.round.player.length).fill(0);
    this.ballPickedUp = Array(this.round.player.length).fill(false);

    this.calculateSummary();
  }

  private calculateSummary() {

    this.round.player.forEach((pl, idx) => {

      // check if at least for one hole the ball was picked up
      this.ballPickedUp[idx] =
        this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).some((v => v != null && v.stroke === ballPickedUpStrokes));

      // both full
      if (pl.roundDetails.ninesFull === 0) {
        // create player score
        this.score[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.stroke).reduce((p, n) => p + n);
        // create player net score
        this.netScore[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.scoreNetto).reduce((p, n) => p + n);
        // create player STB netto
        this.stbNet[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.stbNetto).reduce((p, n) => p + n);
        // create player STB brutto
        this.stbGross[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.stbBrutto).reduce((p, n) => p + n);
        // create player corrected score brutto
        this.corScore[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.corScoreBrutto).reduce((p, n) => p + n);
      // only first full
      } else if (pl.roundDetails.ninesFull === 1) {
        this.score[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 9).map(s => s.stroke).reduce((p, n) => p + n);
        // create player net score
        this.netScore[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 9).map(s => s.scoreNetto).reduce((p, n) => p + n);
        // create player STB netto
        this.stbNet[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 9).map(s => s.stbNetto).reduce((p, n) => p + n);
        // create player STB brutto
        this.stbGross[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 9).map(s => s.stbBrutto).reduce((p, n) => p + n);
        // create player corrected score brutto
        this.corScore[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 9).map(s => s.corScoreBrutto).reduce((p, n) => p + n);
      // only second full
      } else if (pl.roundDetails.ninesFull === 2) {
        this.score[idx] = this.round.scoreCard.slice((idx * 18) + 9, (idx * 18) + 18).map(s => s.stroke).reduce((p, n) => p + n);
        // create player net score
        this.netScore[idx] = this.round.scoreCard.slice((idx * 18) + 9, (idx * 18) + 18).map(s => s.scoreNetto).reduce((p, n) => p + n);
        // create player STB netto
        this.stbNet[idx] = this.round.scoreCard.slice((idx * 18) + 9, (idx * 18) + 18).map(s => s.stbNetto).reduce((p, n) => p + n);
        // create player STB brutto
        this.stbGross[idx] = this.round.scoreCard.slice((idx * 18) + 9, (idx * 18) + 18).map(s => s.stbBrutto).reduce((p, n) => p + n);
        // create player corrected score brutto
        this.corScore[idx] = this.round.scoreCard.slice((idx * 18) + 9, (idx * 18) + 18).map(s => s.corScoreBrutto).reduce((p, n) => p + n);
      } else {
        // create player score
        this.score[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.stroke).reduce((p, n) => p + n);
      }

      // create player putts
      this.putts[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.pats).reduce((p, n) => p + n);
      // create player penalties
      this.penalties[idx] = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.penalty).reduce((p, n) => p + n);
    });

    this.display = true;
  }
}
