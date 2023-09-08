import { Component, OnInit, ViewChild, ViewContainerRef, WritableSignal, signal } from '@angular/core';
import { League, LeagueStatus } from '../_models/league';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { Router } from '@angular/router';
import { AlertService } from '@/_services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { faSearchPlus, faSearchMinus, IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { tap } from 'rxjs';

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.css']
})
export class LeagueComponent  implements OnInit {

  faSearchPlus: IconDefinition;
  faSearchMinus: IconDefinition;
  faMinusCircle: IconDefinition;

  league: League;
  //leaguePlayers: LeaguePlayer[];

  playerId: number;
  //displayRound: Array<boolean>;

  private display: WritableSignal<boolean>;

  // rndSpinner: boolean[];

  // tournamentResults: Array<TournamentResult>;

  private loadingClose: WritableSignal<boolean>;
  private loadingDelete: WritableSignal<boolean>;
  // loadingPDF: boolean;

  @ViewChild('leagueContainer', {read: ViewContainerRef}) leagueContainerRef: ViewContainerRef;

  constructor(private leagueHttpService: LeagueHttpService,
              private navigationService: NavigationService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService,
              private dialog: MatDialog) {}

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {

      this.display = signal(false);

      this.loadingClose  = signal(false);
      this.loadingDelete = signal(false);
      // this.loadingPDF = false;

      this.faSearchPlus = faSearchPlus;
      this.faSearchMinus = faSearchMinus;
      this.faMinusCircle = faMinusCircle;

      this.league = this.navigationService.getLeague();
      this.playerId = this.authenticationService.currentPlayerValue.id;
      /*
      this.tournamentHttpService.getTournamentResults(this.tournament.id).pipe(
        tap(
          (retTournamentResults: TournamentResult[]) => {
            this.tournamentResults = retTournamentResults;
            this.displayRound = Array(this.tournamentResults.length).fill(false);
            this.rndSpinner = Array(this.tournamentResults.length).fill(false);
            this.display = true;
          })
      ).subscribe();
      */
      this.display.set(true);
    }
  }

  deleteLeague() : void {
  }

  closeLeague() : void {

    this.alertService.clear();

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@league-CloseConf:Are you sure you want to close league?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingClose.set(true);
        this.leagueHttpService.closeLeague(this.navigationService.getLeague().id).pipe(tap(
          () => {
            this.navigationService.getLeague().status = LeagueStatus.STATUS_CLOSE;
            this.alertService.success($localize`:@@league-CloseMsg:League successfully closed`, true);
            this.loadingClose.set(false);
            this.router.navigate(['mpLeagues']).catch(error => console.log(error));
          })
        ).subscribe();
      }
    });
  }

  async loadComponent(comp: number) {

    if (this.leagueContainerRef !== undefined) {
      this.leagueContainerRef.clear();
    }

    if (comp === 0) {
      const {LeaguePlayerComponent} = await import('../league-player/league-player.component');
      this.leagueContainerRef.createComponent(LeaguePlayerComponent);
    }
  }

  isDisplay() {
    return this.display();
  }

  isLoadingClose() {
    return this.loadingClose();
  }

  isLoadingDelete() {
    return this.loadingDelete();
  }
}
