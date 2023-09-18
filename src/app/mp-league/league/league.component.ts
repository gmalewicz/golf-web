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
import { combineLatest, tap } from 'rxjs';
import { generateResults } from '../_helpers/common';

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

  playerId: number;

  private display: WritableSignal<boolean>;

  private loadingClose: WritableSignal<boolean>;
  private loadingDelete: WritableSignal<boolean>;

  @ViewChild('leagueContainer', {read: ViewContainerRef}) leagueContainerRef: ViewContainerRef;

  constructor(private leagueHttpService: LeagueHttpService,
              public navigationService: NavigationService,
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

      // read from database only if no matches exists
      if (this.navigationService.matches().length === 0) {

        // get course holes and available tees
        combineLatest([
          this.leagueHttpService.getMatches(this.league.id),
          this.leagueHttpService.getLeaguePlayers(this.navigationService.getLeague().id)
        ]).subscribe(([retMatches, retLeaguelayers]) => {
          this.navigationService.players.set(retLeaguelayers);
          this.navigationService.matches.set(retMatches);
          this.updateNicks();
          generateResults(retMatches, this.navigationService.results);
          this.display.set(true);
        });
      } else {
        this.display.set(true);
      }
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

  updateNicks() {

    this.navigationService.matches.mutate(matches => matches.forEach(match => {
      // update only if winnerNick is undefined (when it is read from database)
      if (match.winnerNick === undefined) {
        match.winnerNick = this.navigationService.players().find(player => player.id === match.winnerId).nick;
      }
    }));
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
