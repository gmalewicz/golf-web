import { Component, OnInit, ViewChild, ViewContainerRef, WritableSignal, signal } from '@angular/core';
import { LeagueStatus } from '../_models/league';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { Router } from '@angular/router';
import { AlertService } from '@/_services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { faSearchPlus, faSearchMinus, IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { combineLatest, tap } from 'rxjs';

@Component({
  selector: 'app-league',
  templateUrl: './league.component.html',
  styleUrls: ['./league.component.css']
})
export class LeagueComponent  implements OnInit {

  faSearchPlus: IconDefinition;
  faSearchMinus: IconDefinition;
  faMinusCircle: IconDefinition;

  dupa: true;

  playerId: number;

  private display: WritableSignal<boolean>;

  private loadingClose: WritableSignal<boolean>;
  private loadingDelete: WritableSignal<boolean>;

  @ViewChild('leagueContainer', {read: ViewContainerRef}) leagueContainerRef: ViewContainerRef | undefined;

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

      this.faSearchPlus = faSearchPlus;
      this.faSearchMinus = faSearchMinus;
      this.faMinusCircle = faMinusCircle;

      this.playerId = this.authenticationService.currentPlayerValue.id;

      // read from database only if no matches exists
      if (this.navigationService.matches().length === 0) {

        // get course holes and available tees
        combineLatest([
          this.leagueHttpService.getMatches(this.navigationService.league().id),
          this.leagueHttpService.getLeaguePlayers(this.navigationService.league().id)
        ]).subscribe(([retMatches, retLeaguelayers]) => {
          this.navigationService.players.set(retLeaguelayers.sort((a,b) => a.playerId - b.playerId));
          this.navigationService.matches.set(retMatches);
          this.updateNicks();
          this.display.set(true);
        });
      } else {
        this.display.set(true);
      }
    }
  }

  deleteLeague() : void {

    this.alertService.clear();

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });

    dialogRef.componentInstance.confirmMessage = $localize`:@@league-DeleteConf:Are you sure you want to delete league with all players and matches results?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingDelete.set(true);
        this.leagueHttpService.deleteLeague(this.navigationService.league().id).pipe(tap(
          () => {
            this.alertService.success($localize`:@@league-DeleteMsg:League successfully deleted`, true);
            this.loadingDelete.set(false);
            this.router.navigate(['mpLeagues']).catch(error => console.log(error));
          })
        ).subscribe();
      }
    });

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
        this.leagueHttpService.closeLeague(this.navigationService.league().id).pipe(tap(
          () => {
            this.navigationService.league().status = LeagueStatus.STATUS_CLOSE;
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
        match.winnerNick = this.navigationService.players().find(player => player.playerId === match.winnerId).nick;
      }
      if (match.looserNick === undefined) {
        match.looserNick = this.navigationService.players().find(player => player.playerId === match.looserId).nick;
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
