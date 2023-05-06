import { Component, OnInit} from '@angular/core';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { Player, Round, teeTypes } from '@/_models';
import { Router} from '@angular/router';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { tap } from 'rxjs/operators';
import { calculateCourseHCP, calculateHoleHCP, calculateScoreDifferential, getPlayedCoursePar } from '@/_helpers/whs.routines';
import { combineLatest } from 'rxjs';
import { generatePDF } from '@/_helpers/common';
import { RoundsNavigationService } from '@/rounds/roundsNavigation.service';



@Component({
  selector: 'app-round',
  templateUrl: './round.component.html'
})
export class RoundComponent implements OnInit {

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  loading: boolean;
  display: boolean;
  round: Round;
  viewOnly: boolean;

  selectedTab: number;
  loadingPDF: boolean;

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private router: Router,
              private authenticationService: AuthenticationService,
              public dialog: MatDialog,
              public roundsNavigationService: RoundsNavigationService) {

  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch();
    } else {

      this.loading = false;
      this.loadingPDF = false;
      this.round = history.state.data.round;
      this.viewOnly = true;

      combineLatest([this.httpService.getScoreCards(this.round.id),
                     this.httpService.getPlayersRoundDetails(this.round.id),
                     this.httpService.getHoles(this.round.course.id)]).pipe(tap(
        ([retScoreCards, playerRoundsDetails, retHoles]) => {

          this.round.scoreCard = retScoreCards;
          this.round.player = [];

          for (let idx = 0; idx < retScoreCards.length; idx += 18) {
            this.round.player.push(retScoreCards[idx].player);
          }

          this.viewOnlyCheck();

          playerRoundsDetails.forEach((pr, idx) => this.round.player[idx].roundDetails = pr);

          this.round.course.holes = retHoles;

          this.round.player.forEach((pl, idx) => {
            this.setNinesFull(pl, idx);
            this.calculateCourseAndHoleHcp(pl, idx);
            this.calculateHoleResult(idx);
            this.calculateScoreDiff(pl, idx);

          });

          this.display = true;
          this.selectedTab = 0;
        })
      ).subscribe();
    }
  }

  private viewOnlyCheck() {

    this.round.player.forEach(pl => {
      if (pl.id === this.authenticationService.currentPlayerValue.id) {
        this.viewOnly = false;
      }
    });

  }

  onDelete() {

    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = $localize`:@@round-deleteCnf:Are you sure you want to delete score card?`;
    this.dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do confirmation actions
        this.loading = true;
        this.httpService.deleteScoreCard(this.authenticationService.currentPlayerValue.id, this.round.id).pipe(tap(
          () => {
            this.loading = false;
            this.alertService.success($localize`:@@round-deleteCnfSuccess:The scorecard has been successfully deleted`, true);
            this.router.navigate(['/home']).catch();
          })
        ).subscribe();
      }
      this.dialogRef = null;
    });
  }

  onEdit() {

    // prepare data to pass to ad-scorecard module
    // this.round.course.holes = this.holes;
    this.round.player = [];
    this.round.player.push(this.authenticationService.currentPlayerValue);
    // remove rounds for all other players
    this.round.scoreCard = this.round.scoreCard.filter(s => s.player.id === this.authenticationService.currentPlayerValue.id);
    this.router.navigate(['/addScorecard/' + this.round.course.id + '/' +
      this.round.course.name + '/' +
      this.round.course.par], {
      state: { data: { round: this.round } }
    }).catch();

  }

  onTabClick(tab: number) {
    this.selectedTab = tab;
  }

  private setNinesFull(pl: Player, idx: number) {

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
      pl.roundDetails.ninesFull = 0;
    } else if (first9full) {
      pl.roundDetails.ninesFull =  1;
    } else if (second9full) {
      pl.roundDetails.ninesFull =  2;
    } else {
      pl.roundDetails.ninesFull =  -1;
    }

    // not allow to see WHS statistic if 18 holes tee chosen for 9 holes played
    if (pl.roundDetails.teeType === teeTypes.TEE_TYPE_18 && pl.roundDetails.ninesFull !== 0)  {
      pl.roundDetails.ninesFull =  -1;
    }
  }

  private calculateCourseAndHoleHcp(pl: Player, idx: number) {

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
  }

  private calculateHoleResult(idx) {
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

  private calculateScoreDiff(pl: Player, idx: number) {
    if (pl.roundDetails.ninesFull === 0) {

       // create player corrected score brutto
      const corScore = this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).map(s => s.corScoreBrutto).reduce((p, n) => p + n);

      pl.roundDetails.scoreDiff = calculateScoreDifferential(pl.roundDetails.sr,
                                                            corScore,
                                                            pl.roundDetails.cr,
                                                            true,
                                                            null,
                                                            null);

    } else {

      let par: number;

      if (pl.roundDetails.ninesFull === 1) {
        par = this.round.course.holes.slice(0, 9).map(h => h.par).reduce((p, n) => p + n);
      }
      if (pl.roundDetails.ninesFull === 2) {
        par = this.round.course.holes.slice(10, 18).map(h => h.par).reduce((p, n) => p + n);
      }

      pl.roundDetails.scoreDiff = calculateScoreDifferential(pl.roundDetails.sr,
                                                            this.round.scoreCard.slice(idx * 18, (idx * 18) + 18).
                                                              map(s => s.corScoreBrutto).reduce((p, n) => p + n),
                                                            pl.roundDetails.cr,
                                                            false,
                                                            par,
                                                            pl.roundDetails.whs
                                                            );
    }
  }

  public displayPDF(name: string): void {
    this.loadingPDF = true;
    generatePDF(name, this);
  }

  onCancel() {

    if (history.state.data.back !== undefined && history.state.data.back === true) {
      this.roundsNavigationService.restoreLast();
      this.router.navigate(['/rounds']).catch(error => console.log(error));
    } else {
      this.router.navigate(['/home']).catch();
    }
  }
}
