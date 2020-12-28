import { Component, Input, OnInit} from '@angular/core';
import { Round } from '@/_models';
import { HttpService} from '@/_services';
import { tap } from 'rxjs/operators';
import { calculateCourseHCP, calculateHoleHCP, calculateScoreDifferential, getPlayedCoursePar } from '@/_helpers/whs.routines';

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
  // playerRoundDetails: PlayerRoundDetails;
  // courseHCP: number;
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

  // scoreDiff: number;

  // -1 noone full
  // 0 - both full
  // 1 - first full
  // 2 second full
  ninesFull: number;
  display: boolean;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {

    // console.log(this.playerOffset);

    this.display = false;
    this.ninesFull = -1;

    this.scoreBruttoClass = Array(18).fill('');
    this.scoreNettoClass = Array(18).fill('');

    // create pars for first and last 9
    this.first9par = this.round.course.holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
    this.last9par = this.round.course.par - this.first9par;
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

    if (this.round.player[this.playerOffset].roundDetails === undefined ||
      this.round.player[this.playerOffset].roundDetails.ninesFull === undefined) {

      const emptyHoles = this.round.scoreCard.slice((this.playerOffset * 18), (this.playerOffset * 18) + 18).map(sc => sc.stroke);
      // console.log('empty holes: ' + emptyHoles);
      let first9full = true;
      let second9full = true;
      // check if first 9 is full
      const firstEmptyHoleIdx = emptyHoles.findIndex(value => value === 0);
      if (firstEmptyHoleIdx <= 8 && firstEmptyHoleIdx > -1) {
        first9full = false;
        // console.log('first 9 empty');
      }
      // check if second 9 is full
      if (emptyHoles.lastIndexOf(0) > 8) {
        second9full = false;
        // console.log('second 9 empty');
      }
      // set nines full variable
      if (first9full && second9full) {
        this.ninesFull = 0;
      } else if (first9full) {
        this.ninesFull = 1;
      } else if (second9full) {
        this.ninesFull = 2;
      }
    } else {
      this.ninesFull = this.round.player[this.playerOffset].roundDetails.ninesFull;
    }

    // copy players from scorecard if required
    if (this.round.player === undefined) {
      this.round.player = [];
      let i = 0;
      do {
        this.round.player.push(this.round.scoreCard[i].player);
        i += 18;
      } while ( i < this.round.scoreCard.length);
    }

    // grab data from backend if not available
    if (this.round.player[0].roundDetails === undefined) {
      this.getPlayerRoundDetails();
    } else {
      this.calculateWhsData();
    }
  }

  // get player WHS and tee datails
  private getPlayerRoundDetails() {

    this.httpService.getPlayersRoundDetails(this.round.id).pipe(tap(playerRoundsDetails => {

      playerRoundsDetails.forEach((pr, idx) => this.round.player[idx].roundDetails = pr);

      // console.log(this.round.player);

      this.round.player[this.playerOffset].roundDetails.ninesFull = this.ninesFull;

      this.calculateWhsData();


    })).subscribe();
  }

  private calculateWhsData() {

    // console.log(this.ninesFull);

    // not allow to see WHS statistic if 18 holes tee chosen for 9 holes played
    if (this.round.player[this.playerOffset].roundDetails.teeType === 0 && this.ninesFull !== 0)  {
      this.ninesFull = -1;
    }

    if (this.ninesFull !== -1 && this.round.player[this.playerOffset].roundDetails.scoreDiff === undefined) {

      this.round.player[this.playerOffset].roundDetails.courseHCP =
                       calculateCourseHCP(this.round.player[this.playerOffset].roundDetails.teeType,
                                          this.round.player[this.playerOffset].roundDetails.whs,
                                          this.round.player[this.playerOffset].roundDetails.sr,
                                          this.round.player[this.playerOffset].roundDetails.cr,
                                          getPlayedCoursePar(this.round.course.holes,
                                                            this.round.player[this.playerOffset].roundDetails.teeType,
                                                            this.round.course.par));

      const holeHcp: number[][] = Array(1).fill(0).map(() => new Array(18).fill(0));

      calculateHoleHCP( 0,
                        this.round.player[this.playerOffset].roundDetails.teeType,
                        this.round.player[this.playerOffset].roundDetails.courseHCP,
                        holeHcp,
                        this.round.course);

      holeHcp[0].forEach((h, i) => this.round.scoreCard[i + (this.playerOffset * 18)].hcp = h);

      // for 9 holes round remapping of si for played 9 is required
      if (this.ninesFull === 1 || this.ninesFull === 2) {
        this.updFor9();
      }
      this.round.course.holes.forEach((h, i) => {
        // update score netto
        this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto = this.round.scoreCard[i + (this.playerOffset * 18)].stroke -
          this.round.scoreCard[i + (this.playerOffset * 18)].hcp;
        if (this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto < 0) {
          this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto = 0;
        }

        // update STB netto
        this.round.scoreCard[i + (this.playerOffset * 18)].stbNetto = this.round.course.holes[i].par -
          this.round.scoreCard[i + (this.playerOffset * 18)].scoreNetto + 2;
        if (this.round.scoreCard[i + (this.playerOffset * 18)].stbNetto < 0 || this.round.scoreCard[i +
            (this.playerOffset * 18)].stroke === 0) {
          this.round.scoreCard[i + (this.playerOffset * 18)].stbNetto = 0;
        }
        // update STB brutto
        this.round.scoreCard[i + (this.playerOffset * 18)].stbBrutto = this.round.course.holes[i].par -
          this.round.scoreCard[i + (this.playerOffset * 18)].stroke + 2;
        if (this.round.scoreCard[i + (this.playerOffset * 18)].stbBrutto < 0 || this.round.scoreCard[i +
          (this.playerOffset * 18)].stroke === 0) {
          this.round.scoreCard[i + (this.playerOffset * 18)].stbBrutto = 0;
        }
        // update corrected score brutto
        if (this.round.scoreCard[i + (this.playerOffset * 18)].
          hcp + 2 + h.par < this.round.scoreCard[i + (this.playerOffset * 18)].stroke) {
          this.round.scoreCard[i + (this.playerOffset * 18)].corScoreBrutto = this.round.scoreCard[i +
            (this.playerOffset * 18)].hcp + 2 + h.par;
        } else {
          this.round.scoreCard[i + (this.playerOffset * 18)].corScoreBrutto = this.round.scoreCard[i + (this.playerOffset * 18)].stroke;
        }
      });
    }

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

    // calculate score differntial
    if (this.round.player[this.playerOffset].roundDetails.scoreDiff === undefined) {
      if (this.ninesFull === 0) {
        this.round.player[this.playerOffset].roundDetails.scoreDiff =
                        calculateScoreDifferential(this.round.player[this.playerOffset].roundDetails.sr,
                                                    this.first9CorScorBrutto +  this.last9CorScorBrutto,
                                                    this.round.player[this.playerOffset].roundDetails.cr,
                                                    true);
      } else {
        this.round.player[this.playerOffset].roundDetails.scoreDiff =
                        calculateScoreDifferential(this.round.player[this.playerOffset].roundDetails.sr,
                                                    this.first9CorScorBrutto +  this.last9CorScorBrutto,
                                                    this.round.player[this.playerOffset].roundDetails.cr,
                                                    false);
      }
    }
    this.display = true;
  }


  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }

  private updFor9() {

    if (this.ninesFull === 1) {

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
        this.last9score += this.round.scoreCard[i].stroke;
      }
    }

    if (this.ninesFull === 2) {

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
        this.first9score += this.round.scoreCard[i].stroke;
      }
    }

  }

  calculateStyle(i: number) {

    if (i >= 9 && this.ninesFull === 1) {
        return 'grey';
    }

    if (i < 9 && this.ninesFull === 2) {
      return 'grey';
    }

    return '';
  }
}
