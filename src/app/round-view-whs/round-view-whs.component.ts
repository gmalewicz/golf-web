import { PlayerRoundDetails } from './../_models/playerRoundDetails';
import { Component, OnInit } from '@angular/core';
import { Round } from '@/_models';
import { AuthenticationService, HttpService, AlertService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';

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
  scoreBruttoClass: string[] = Array(18).fill('');
  scoreNettoClass: string[] = Array(18).fill('');

  constructor(private authenticationService: AuthenticationService,
              private httpService: HttpService,
              private alertService: AlertService) { }

  ngOnInit(): void {

    // get round from state
    this.round = history.state.data.round;
    // create pars for first and last 9
    this.first9par = this.round.course.holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
    this.last9par = this.round.course.par - this.first9par;
    // create player score for each 9
    this.first9score = this.round.scoreCard.map(s => s.stroke).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
    this.last9score = this.round.scoreCard.map(s => s.stroke).reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });

    // this.scoreBruttoClass = Array(18).fill('');
    this.scoreBruttoClass.forEach((v, i) => {
      if (this.round.scoreCard[i].stroke < this.round.course.holes[i].par - 1) {

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

    this.getPlayerRoundDetails(this.authenticationService.currentPlayerValue.id, this.round.id);

  }

  // get player WHS and tee datails
  getPlayerRoundDetails(playerId: number, roundId: number) {

    this.httpService.getPlayerRoundDetails
      (this.authenticationService.currentPlayerValue.id, this.round.id).subscribe(playerRoundDetails => {

        this.playerRoundDetails = playerRoundDetails;

        // calculate course HCP
        this.courseHCP = Math.round(this.playerRoundDetails.whs * this.playerRoundDetails.sr / 113 +
          this.playerRoundDetails.cr - this.round.course.par);

        // calculate hole hcp for player and save it in score card
        const hcpAll = Math.floor(this.courseHCP / 18);
        const hcpIncMaxHole = this.courseHCP - (hcpAll * 18);
        console.log('hcpAll ' + hcpAll);
        console.log('hcpIncMaxHole ' + hcpIncMaxHole);

        // fill all holes with hcpAll value or initialize it with 0 if hcpAll is 0
        this.round.scoreCard.forEach((s, i) => s.hcp = hcpAll);
        this.round.course.holes.forEach((h, i) => {
          if (hcpIncMaxHole > 0 && h.si <= hcpIncMaxHole) {
            // if some holes needs hcp update increase them
            this.round.scoreCard[i].hcp += 1;
          }
          // update score netto
          this.round.scoreCard[i].scoreNetto = this.round.scoreCard[i].stroke - this.round.scoreCard[i].hcp;

          // update STB netto
          this.round.scoreCard[i].stbNetto = this.round.course.holes[i].par - this.round.scoreCard[i].scoreNetto + 2;
          if (this.round.scoreCard[i].stbNetto < 0) {
            this.round.scoreCard[i].stbNetto = 0;
          }
          // update STB brutto
          this.round.scoreCard[i].stbBrutto = this.round.course.holes[i].par - this.round.scoreCard[i].stroke + 2;
          if (this.round.scoreCard[i].stbBrutto < 0) {
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
          if (this.round.scoreCard[i].scoreNetto < this.round.course.holes[i].par - 1) {

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
        // create player STB brutto for each 9
        this.first9CorScorBrutto = this.round.scoreCard.map(s => s.corScoreBrutto)
          .reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
        this.last9CorScorBrutto = this.round.scoreCard.map(s => s.corScoreBrutto)
          .reduce((p, n, i) => { if (i >= 9) { return p + n; } else { return 0; } });

      },
        (error: HttpErrorResponse) => {
          this.alertService.error(error.error.message, false);
        });

  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }

}
