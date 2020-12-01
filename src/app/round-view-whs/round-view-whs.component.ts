import { PlayerRoundDetails } from './../_models/playerRoundDetails';
import { Component, OnInit} from '@angular/core';
import { Round, Hole } from '@/_models';
import { AuthenticationService, HttpService, AlertService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-round-view-whs',
  templateUrl: './round-view-whs.component.html',
  styleUrls: ['./round-view-whs.component.css']
})
export class RoundViewWHSComponent implements OnInit {

  round: Round;
  first9par: number;
  last9par: number;
  first9score: number;
  last9score: number;
  playerRoundDetails: PlayerRoundDetails;
  courseHCP: number;
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

  scoreDiff: number;

  // -1 noone full
  // 0 - both full
  // 1 - first full
  // 2 second full
  ninesFull: number;

  constructor(private authenticationService: AuthenticationService,
              private httpService: HttpService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.ninesFull = -1;

      this.scoreBruttoClass = Array(18).fill('');
      this.scoreNettoClass = Array(18).fill('');

      // get round from state
      this.round = history.state.data.round;
      // create pars for first and last 9
      this.first9par = this.round.course.holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
      this.last9par = this.round.course.par - this.first9par;
      // create player score for each 9
      this.first9score = this.round.scoreCard.map(s => s.stroke).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
      this.last9score = this.round.scoreCard.map(s => s.stroke).reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });
      // create player putt for each 9
      this.first9Putt = this.round.scoreCard.map(s => s.pats).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
      this.last9Putt = this.round.scoreCard.map(s => s.pats).reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });
      // create player penalty for each 9
      this.first9Penalty =
        this.round.scoreCard.map(s => s.penalty).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
      this.last9Penalty =
        this.round.scoreCard.map(s => s.penalty).reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });

      this.scoreBruttoClass.forEach((v, i) => {

        if (this.round.scoreCard[i].stroke === 0) {

          this.scoreBruttoClass[i] = 'par';

        } else if (this.round.scoreCard[i].stroke < this.round.course.holes[i].par - 1) {

          this.scoreBruttoClass[i] = 'eagle';

        } else if (this.round.scoreCard[i].stroke < this.round.course.holes[i].par) {

          this.scoreBruttoClass[i] = 'birdie';

        } else if (this.round.scoreCard[i].stroke === this.round.course.holes[i].par) {

          this.scoreBruttoClass[i] = 'par';

        } else if (this.round.scoreCard[i].stroke === this.round.course.holes[i].par + 1) {
          this.scoreBruttoClass[i] = 'boggey';

        } else if (this.round.scoreCard[i].stroke > this.round.course.holes[i].par + 1) {
          this.scoreBruttoClass[i] = 'doubleBoggey';

        }
      });

      const emptyHoles = this.round.scoreCard.map(sc => sc.stroke);
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

      this.getPlayerRoundDetails(this.authenticationService.currentPlayerValue.id, this.round.id);
    }
  }

  // get player WHS and tee datails
  getPlayerRoundDetails(playerId: number, roundId: number) {

    this.httpService.getPlayerRoundDetails
      (this.authenticationService.currentPlayerValue.id, this.round.id).subscribe(playerRoundDetails => {

        this.playerRoundDetails = playerRoundDetails;


        console.log('this.ninesFull ' + this.ninesFull);
        console.log('teeType ' + playerRoundDetails.teeType);
         // not allow to see WHS statistic if 18 holes tee chosen for 9 holes played
        if (playerRoundDetails.teeType === 0 && this.ninesFull !== 0)  {
            this.ninesFull = -1;
        }

        // console.log('this.playerRoundDetails.whs ' + this.playerRoundDetails.whs);
        // console.log('this.playerRoundDetails.sr ' + this.playerRoundDetails.sr);
        // console.log('this.playerRoundDetails.cr ' + this.playerRoundDetails.cr);
        // console.log('this.first9par ' + this.first9par);

        // calculate course HCP
        switch (this.ninesFull) {
          // first nine is full
          case 1: {
            // console.log('case 1');
            this.courseHCP = Math.round((this.playerRoundDetails.whs / 2) * this.playerRoundDetails.sr / 113 +
              this.playerRoundDetails.cr - this.first9par);
            break;
          }
          // second nine is full
          case 2: {
            // console.log('case 2');
            this.courseHCP = Math.round((this.playerRoundDetails.whs / 2) * this.playerRoundDetails.sr / 113 +
              this.playerRoundDetails.cr - this.last9par);
            break;
          }
          // both nines has been played
          case 0: {
            // console.log('case 0');
            this.courseHCP = Math.round(this.playerRoundDetails.whs * this.playerRoundDetails.sr / 113 +
              this.playerRoundDetails.cr - this.round.course.par);
            break;
          }
        }

        let hcpAll: number;
        let hcpIncMaxHole: number;
        // calculate hole hcp for player and save it in score card
        if (this.ninesFull === 0) {
          hcpAll = Math.floor(this.courseHCP / 18);
          hcpIncMaxHole = this.courseHCP - (hcpAll * 18);
        } else {
          hcpAll = Math.floor(this.courseHCP / 9);
          hcpIncMaxHole = this.courseHCP - (hcpAll * 9);
        }



        // const hcpAll = Math.floor(this.courseHCP / 18);
        // const hcpIncMaxHole = this.courseHCP - (hcpAll * 18);
        // console.log('hcpAll ' + hcpAll);
        // console.log('hcpIncMaxHole ' + hcpIncMaxHole);

        // fill all holes with hcpAll value or initialize it with 0 if hcpAll is 0
        this.round.scoreCard.forEach((s, i) => s.hcp = hcpAll);

        // for 9 holes round remapping of si for played 9 is required
        if (this.ninesFull === 1 || this.ninesFull === 2) {
          this.updFor9(hcpIncMaxHole);
        }

        this.round.course.holes.forEach((h, i) => {
          if (hcpIncMaxHole > 0 && h.si <= hcpIncMaxHole && this.ninesFull === 0) {
            // if some holes needs hcp update increase them
            this.round.scoreCard[i].hcp += 1;
          }
          // update score netto
          this.round.scoreCard[i].scoreNetto = this.round.scoreCard[i].stroke - this.round.scoreCard[i].hcp;
          if (this.round.scoreCard[i].scoreNetto < 0) {
            this.round.scoreCard[i].scoreNetto = 0;
          }

          // update STB netto
          this.round.scoreCard[i].stbNetto = this.round.course.holes[i].par - this.round.scoreCard[i].scoreNetto + 2;
          if (this.round.scoreCard[i].stbNetto < 0 || this.round.scoreCard[i].stroke === 0) {
            this.round.scoreCard[i].stbNetto = 0;
          }
          // update STB brutto
          this.round.scoreCard[i].stbBrutto = this.round.course.holes[i].par - this.round.scoreCard[i].stroke + 2;
          if (this.round.scoreCard[i].stbBrutto < 0 || this.round.scoreCard[i].stroke === 0) {
            this.round.scoreCard[i].stbBrutto = 0;
          }
          // update corrected score brutto
          if (this.round.scoreCard[i].hcp + 2 + h.par < this.round.scoreCard[i].stroke) {
            this.round.scoreCard[i].corScoreBrutto = this.round.scoreCard[i].hcp + 2 + h.par;
          } else {
            this.round.scoreCard[i].corScoreBrutto = this.round.scoreCard[i].stroke;
          }

        });

        // his.scoreNettoClass = Array(18).fill('');
        this.scoreNettoClass.forEach((v, i) => {

          if (this.round.scoreCard[i].stroke === 0) {

            this.scoreNettoClass[i] = 'par';

          } else if (this.round.scoreCard[i].scoreNetto < this.round.course.holes[i].par - 1) {

            this.scoreNettoClass[i] = 'eagle';

          } else if (this.round.scoreCard[i].scoreNetto < this.round.course.holes[i].par) {

            this.scoreNettoClass[i] = 'birdie';

          } else if (this.round.scoreCard[i].scoreNetto === this.round.course.holes[i].par) {

            this.scoreNettoClass[i] = 'par';

          } else if (this.round.scoreCard[i].scoreNetto === this.round.course.holes[i].par + 1) {
            this.scoreNettoClass[i] = 'boggey';

          } else if (this.round.scoreCard[i].scoreNetto > this.round.course.holes[i].par + 1) {
            this.scoreNettoClass[i] = 'doubleBoggey';

          }
        });

        // create player score for each 9
        this.first9scoreNetto = this.round.scoreCard.map(s => s.scoreNetto)
          .reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9scoreNetto = this.round.scoreCard.map(s => s.scoreNetto)
          .reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });
        // create player STB netto for each 9
        this.first9StbNetto = this.round.scoreCard.map(s => s.stbNetto)
          .reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9StbNetto = this.round.scoreCard.map(s => s.stbNetto)
          .reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });
        // create player STB brutto for each 9
        this.first9StbBrutto = this.round.scoreCard.map(s => s.stbBrutto)
          .reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9StbBrutto = this.round.scoreCard.map(s => s.stbBrutto)
          .reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });
        // create player corrected score brutto for each 9
        this.first9CorScorBrutto = this.round.scoreCard.map(s => s.corScoreBrutto)
          .reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9CorScorBrutto = this.round.scoreCard.map(s => s.corScoreBrutto)
          .reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });

        // calculate score differntial
        if (this.ninesFull === 0) {
          this.scoreDiff = (113 / this.playerRoundDetails.sr) *
            ((this.first9CorScorBrutto +  this.last9CorScorBrutto) - this.playerRoundDetails.cr);
        } else {
          this.scoreDiff = (113 / this.playerRoundDetails.sr) *
          ((this.first9CorScorBrutto +  this.last9CorScorBrutto) - (2 * this.playerRoundDetails.cr));
        }

      },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.message, false);
        });

  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }

  private updFor9(hcpIncMaxHole: number) {

    // break if nothing for upd
    if (hcpIncMaxHole <= 0) {
      return;
    }

    if (this.ninesFull === 1) {

      // first update hcp

      const holesUpd: Hole[]  = this.round.course.holes.slice(0, 9).sort((a, b) => a.si - b.si);

      const maxHoleSiForUpd: number = holesUpd[hcpIncMaxHole - 1].si;

      this.round.scoreCard.forEach((s, i) => {

        if (i < 9 && this.round.course.holes[i].si <= maxHoleSiForUpd) {
          this.round.scoreCard[i].hcp++;
        }
      });

      // then

      for (let i = 9; i < 18; i++) {
        // copy par for the first 9 to the second
        this.round.course.holes[i].par = this.round.course.holes[i - 9].par;
        // copy hcp from the first 9 to the second
        this.round.scoreCard[i].hcp = this.round.scoreCard[i - 9].hcp;
        // copy SI from the first 9 to the second
        this.round.course.holes[i].si = this.round.course.holes[i - 9].si;
        // generate artificial score brutto to be par netto for the second 9 (except hole 10 which
        // is par netto + 1)
        if (i === 9) {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par + 1;

        } else {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par;
        }
        this.last9score += this.round.scoreCard[i].stroke;
      }

      // holesUpd.forEach(h => console.log('sorted hole: ' + h.si));
      // this.round.scoreCard.forEach(h => console.log('hole score: ' + h.hole + ' ' + h.stroke));
    }

    if (this.ninesFull === 2) {

      const holesUpd: Hole[]  = this.round.course.holes.slice(9, 18).sort((a, b) => a.si - b.si);

      const maxHoleSiForUpd: number = holesUpd[hcpIncMaxHole - 1].si;

      this.round.scoreCard.forEach((s, i) => {

        if (i >= 9 && this.round.course.holes[i].si <= maxHoleSiForUpd) {
          this.round.scoreCard[i].hcp++;
        }

      });

      // then

      for (let i = 0; i < 9; i++) {
        // copy par for the first 9 to the second
        this.round.course.holes[i].par = this.round.course.holes[i + 9].par;

        // copy hcp from the second 9 to the first
        this.round.scoreCard[i].hcp = this.round.scoreCard[i + 9].hcp;
        // copy SI from the second 9 to the first
        this.round.course.holes[i].si = this.round.course.holes[i + 9].si;
        // generate artificial score brutto to be par netto for the first 9 (except hole 1 which
        // is par netto + 1)
        if (i === 0) {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par + 1;
        } else {
          this.round.scoreCard[i].stroke = this.round.scoreCard[i].hcp + this.round.course.holes[i].par;
        }
        this.first9score += this.round.scoreCard[i].stroke;
      }

      // holesUpd.forEach(h => console.log('sorted hole: ' + h.si));
      // this.round.scoreCard.forEach(h => console.log('hole hsp: ' + h.hole + ' ' + h.hcp));
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
