import { teeTypes } from './../_models/tee';
import { calculateCourseHCP, calculateHoleHCP, calculateScoreDifferential, getPlayedCoursePar } from '@/_helpers/whs.routines';
import { Round } from '@/_models/round';
import { HttpService } from '@/_services/http.service';
import { Component, Input, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-round-summary',
  templateUrl: './round-summary.component.html',
  styleUrls: ['./round-summary.component.css']
})
export class RoundSummaryComponent implements OnInit {

  @Input() round: Round;

  score: number[];
  netScore: number[];
  corScore: number[];
  stbNet: number[];
  stbGross: number[];
  // scoreDiff: number[];
  putts: number[];
  penalties: number[];

  // -1 noone full
  // 0 - both full
  // 1 - first full
  // 2 second full
  ninesFull: number[];

  display: boolean;


  constructor(private httpService: HttpService) { }

  ngOnInit(): void {

    this.display = false;

    this.score = Array(this.round.player.length).fill(0);
    this.netScore = Array(this.round.player.length).fill(0);
    this.corScore = Array(this.round.player.length).fill(0);
    this.stbNet = Array(this.round.player.length).fill(0);
    this.stbGross = Array(this.round.player.length).fill(0);
    // this.scoreDiff = Array(this.round.player.length).fill(0);
    this.putts = Array(this.round.player.length).fill(0);
    this.penalties = Array(this.round.player.length).fill(0);

    this.ninesFull = Array(this.round.player.length).fill(-1);

    // grab data fron backend if not available
    if (this.round.player[0].roundDetails === undefined) {
      this.getPlayerRoundDetails();
    } else {
      this.calculateSummary();
    }

  }

  // get player WHS and tee datails
  private getPlayerRoundDetails() {

    this.httpService.getPlayersRoundDetails(this.round.id).pipe(tap(playerRoundsDetails => {

      playerRoundsDetails.forEach((pr, idx) => this.round.player[idx].roundDetails = pr);

      this.calculateSummary();

    })).subscribe();
  }

  private calculateSummary() {

    this.round.player.forEach((pl, idx) => {

      // first verify if both nines are full
      if (pl.roundDetails.ninesFull === undefined) {

        const emptyHoles = this.round.scoreCard.slice((idx * 18), (idx * 18) + 18).map(sc => sc.stroke);
        let first9full = true;
        let second9full = true;
        // check if first 9 is full
        const firstEmptyHoleIdx = emptyHoles.findIndex(value => value === 0);
        if (firstEmptyHoleIdx <= 8 && firstEmptyHoleIdx > -1) {
          first9full = false;
        }
        // check if second 9 is full
        if (emptyHoles.lastIndexOf(0) > 8) {
          second9full = false;
        }
        // set nines full variable
        if (first9full && second9full) {
          this.ninesFull[idx] = 0;
        } else if (first9full) {
          this.ninesFull[idx] = 1;
        } else if (second9full) {
          this.ninesFull[idx] = 2;
        }
        pl.roundDetails.ninesFull = this.ninesFull[idx];
      } else {
        this.ninesFull[idx] = pl.roundDetails.ninesFull;
      }

      // not allow to see WHS statistic if 18 holes tee chosen for 9 holes played
      if (pl.roundDetails.teeType === teeTypes.TEE_TYPE_18 && this.ninesFull[idx] !== 0)  {
        this.ninesFull[idx] = -1;
      }

      //console.log(this.ninesFull[idx]);


      if (this.ninesFull[idx] !== -1 && pl.roundDetails.scoreDiff === undefined) {

        pl.roundDetails.courseHCP = calculateCourseHCP(pl.roundDetails.teeType,
                                                       pl.roundDetails.whs,
                                                       pl.roundDetails.sr,
                                                       pl.roundDetails.cr,
                                                       getPlayedCoursePar(this.round.course.holes,
                                                                          pl.roundDetails.teeType,
                                                                          this.round.course.par));

        const holeHcp: number[][] = Array(1).fill(0).map(() => new Array(18).fill(0));

        calculateHoleHCP( 0,
                          pl.roundDetails.teeType,
                          pl.roundDetails.courseHCP,
                          holeHcp,
                          this.round.course);

        holeHcp[0].forEach((h, i) => this.round.scoreCard[i + (idx * 18)].hcp = h);

        // for 9 holes round remapping of si for played 9 is required
        if (this.ninesFull[idx] === 1 || this.ninesFull[idx] === 2) {
          this.updFor9(idx);
        }

        this.round.course.holes.forEach((h, i) => {
          // update score netto
          this.round.scoreCard[i + (idx * 18)].scoreNetto = this.round.scoreCard[i + (idx * 18)].stroke -
            this.round.scoreCard[i + (idx * 18)].hcp;
          if (this.round.scoreCard[i + (idx * 18)].scoreNetto < 0) {
            this.round.scoreCard[i + (idx * 18)].scoreNetto = 0;
          }

          // update STB netto
          this.round.scoreCard[i + (idx * 18)].stbNetto = this.round.course.holes[i].par -
            this.round.scoreCard[i + (idx * 18)].scoreNetto + 2;
          if (this.round.scoreCard[i + (idx * 18)].stbNetto < 0 || this.round.scoreCard[i +
              (idx * 18)].stroke === 0) {
            this.round.scoreCard[i + (idx * 18)].stbNetto = 0;
          }
          // update STB brutto
          this.round.scoreCard[i + (idx * 18)].stbBrutto = this.round.course.holes[i].par -
            this.round.scoreCard[i + (idx * 18)].stroke + 2;
          if (this.round.scoreCard[i + (idx * 18)].stbBrutto < 0 || this.round.scoreCard[i +
            (idx * 18)].stroke === 0) {
            this.round.scoreCard[i + (idx * 18)].stbBrutto = 0;
          }
          // update corrected score brutto
          if (this.round.scoreCard[i + (idx * 18)].hcp + 2 + h.par < this.round.scoreCard[i + (idx * 18)].stroke) {
            this.round.scoreCard[i + (idx * 18)].corScoreBrutto = this.round.scoreCard[i +
              (idx * 18)].hcp + 2 + h.par;
          } else {
            this.round.scoreCard[i + (idx * 18)].corScoreBrutto = this.round.scoreCard[i + (idx * 18)].stroke;
          }
        });
      }

      // both full
      if (this.ninesFull[idx] === 0) {
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
      } else if (this.ninesFull[idx] === 1) {
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
      } else if (this.ninesFull[idx] === 2) {
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


      // calculate score differntial
      if (pl.roundDetails.scoreDiff === undefined) {
        if (this.ninesFull[idx] === 0) {
          pl.roundDetails.scoreDiff = calculateScoreDifferential(pl.roundDetails.sr,
                                                                this.corScore[idx],
                                                                pl.roundDetails.cr,
                                                                true);

        } else {
          pl.roundDetails.scoreDiff = calculateScoreDifferential(pl.roundDetails.sr,
                                                                this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).
                                                                  map(s => s.corScoreBrutto).reduce((p, n) => p + n),
                                                                pl.roundDetails.cr,
                                                                false);
        }
      }
    });

    this.display = true;
  }

  private updFor9(idx: number) {

    if (this.ninesFull[idx] === 1) {

      for (let i = 9; i < 18; i++) {
        // copy par for the first 9 to the second
        this.round.course.holes[i].par = this.round.course.holes[i - 9].par;
        // copy hcp from the first 9 to the second
        this.round.scoreCard[i].hcp = this.round.scoreCard[i - 9].hcp;
        // copy SI from the first 9 to the second
        this.round.course.holes[i].si = this.round.course.holes[i - 9].si;
        // generate artificial score brutto to be par netto for the second 9 (except hole 10 which is par netto + 1)
        if (i === 9) {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par + 1;

        } else {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par;
        }
        this.score[idx] += this.round.scoreCard[i].stroke;
      }
    }

    if (this.ninesFull[idx] === 2) {

      for (let i = 0; i < 9; i++) {
        // copy par for the first 9 to the second
        this.round.course.holes[i].par = this.round.course.holes[i + 9].par;

        // copy hcp from the second 9 to the first
        this.round.scoreCard[i].hcp = this.round.scoreCard[i + 9].hcp;
        // copy SI from the second 9 to the first
        this.round.course.holes[i].si = this.round.course.holes[i + 9].si;
        // generate artificial score brutto to be par netto for the first 9 (except hole 1 which is par netto + 1)
        if (i === 0) {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par + 1;
        } else {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par;
        }
        this.score[idx] += this.round.scoreCard[i].stroke;
      }
    }

  }

}
