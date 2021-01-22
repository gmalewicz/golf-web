import { Component, Input, OnInit} from '@angular/core';
import { Round } from '@/_models';

@Component({
  selector: 'app-round-view-whs',
  templateUrl: './round-view-whs.component.html',
  styleUrls: ['./round-view-whs.component.css']
})
export class RoundViewWHSComponent implements OnInit {

  @Input() round: Round;
  @Input() playerOffset: number;

  first9par: number;
  last9par: number;
  first9score: number;
  last9score: number;
  first9scoreNetto: number;
  last9scoreNetto: number;
  first9StbNetto: number;
  last9StbNetto: number;
  first9StbBrutto: number;
  last9StbBrutto: number;
  first9CorScorBrutto: number;
  last9CorScorBrutto: number;
  first9Putt: number;
  last9Putt: number;
  first9Penalty: number;
  last9Penalty: number;
  scoreBruttoClass: string[];
  scoreNettoClass: string[];

  display: boolean;

  constructor() { }

  ngOnInit(): void {

    // console.log(this.playerOffset);

    this.display = false;

    this.scoreBruttoClass = Array(18).fill('');
    this.scoreNettoClass = Array(18).fill('');

    // create pars for first and last 9
    this.first9par = this.round.course.holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
    this.last9par = this.round.course.par - this.first9par;
    if (this.round.player[this.playerOffset].roundDetails.ninesFull === 1) {
      this.last9par = 0;
    } else if (this.round.player[this.playerOffset].roundDetails.ninesFull === 2) {
      this.first9par = 0;
    }
    // create player score for each 9
    this.first9score = this.round.scoreCard.map(s => s.stroke).slice(this.playerOffset * 18, (this.playerOffset * 18) + 9)
      .reduce((p, n) =>  p + n);
    this.last9score = this.round.scoreCard.map(s => s.stroke).slice((this.playerOffset * 18) + 9, (this.playerOffset * 18) + 18)
      .reduce((p, n) =>  p + n);
    // create player putt for each 9
    this.first9Putt = this.round.scoreCard.map(s => s.pats).slice(this.playerOffset * 18, (this.playerOffset * 18) + 9)
      .reduce((p, n) =>  p + n);
    this.last9Putt = this.round.scoreCard.map(s => s.pats).slice((this.playerOffset * 18) + 9, (this.playerOffset * 18) + 18)
      .reduce((p, n) =>  p + n);
    // create player penalty for each 9
    this.first9Penalty = this.round.scoreCard.map(s => s.penalty).slice(this.playerOffset * 18, (this.playerOffset * 18) + 9)
      .reduce((p, n) =>  p + n);
    this.last9Penalty = this.round.scoreCard.map(s => s.penalty).slice((this.playerOffset * 18) + 9, (this.playerOffset * 18) + 18)
      .reduce((p, n) =>  p + n);

    this.scoreBruttoClass.forEach((v, i) => {

      if (this.round.scoreCard[i + (this.playerOffset * 18)].stroke === 0) {

        this.scoreBruttoClass[i] = 'par';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].stroke < this.round.course.holes[i].par - 1) {

        this.scoreBruttoClass[i] = 'eagle';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].stroke < this.round.course.holes[i].par) {

        this.scoreBruttoClass[i] = 'birdie';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].stroke === this.round.course.holes[i].par) {

        this.scoreBruttoClass[i] = 'par';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].stroke === this.round.course.holes[i].par + 1) {
        this.scoreBruttoClass[i] = 'boggey';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].stroke > this.round.course.holes[i].par + 1) {
        this.scoreBruttoClass[i] = 'doubleBoggey';

      }
    });

    this.calculateWhsData();

  }

  private calculateWhsData() {

    this.scoreNettoClass.forEach((v, i) => {

      if (this.round.scoreCard[i + (this.playerOffset * 18)].stroke === 0) {

        this.scoreNettoClass[i] = 'par';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto < this.round.course.holes[i].par - 1) {

        this.scoreNettoClass[i] = 'eagle';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto < this.round.course.holes[i].par) {

        this.scoreNettoClass[i] = 'birdie';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto === this.round.course.holes[i].par) {

        this.scoreNettoClass[i] = 'par';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto === this.round.course.holes[i].par + 1) {
        this.scoreNettoClass[i] = 'boggey';

      } else if (this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto > this.round.course.holes[i].par + 1) {
        this.scoreNettoClass[i] = 'doubleBoggey';

      }
    });

    // create player score for each 9
    this.first9scoreNetto = this.round.scoreCard.slice(this.playerOffset * 18, (this.playerOffset * 18) + 9).map(s => s.scoreNetto)
      .reduce((p, n) => p + n);
    this.last9scoreNetto = this.round.scoreCard.slice((this.playerOffset * 18) + 9, (this.playerOffset * 18) + 18).map(s => s.scoreNetto)
      .reduce((p, n) => p + n);
    // create player STB netto for each 9
    this.first9StbNetto = this.round.scoreCard.slice(this.playerOffset * 18, (this.playerOffset * 18) + 9).map(s => s.stbNetto)
      .reduce((p, n) => p + n);
    this.last9StbNetto = this.round.scoreCard.slice((this.playerOffset * 18) + 9, (this.playerOffset * 18) + 18).map(s => s.stbNetto)
      .reduce((p, n) => p + n);
    // create player STB brutto for each 9
    this.first9StbBrutto = this.round.scoreCard.slice(this.playerOffset * 18, (this.playerOffset * 18) + 9).map(s => s.stbBrutto)
      .reduce((p, n) => p + n);
    this.last9StbBrutto = this.round.scoreCard.slice((this.playerOffset * 18) + 9, (this.playerOffset * 18) + 18).map(s => s.stbBrutto)
      .reduce((p, n) => p + n);
    // create player corrected score brutto for each 9
    this.first9CorScorBrutto = this.round.scoreCard.slice(this.playerOffset * 18, (this.playerOffset * 18) + 9).map(s => s.corScoreBrutto)
      .reduce((p, n) => p + n);
    this.last9CorScorBrutto = this.round.scoreCard.slice((this.playerOffset * 18) + 9, (this.playerOffset * 18) + 18)
      .map(s => s.corScoreBrutto).reduce((p, n) => p + n);

    this.display = true;
  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }
}
