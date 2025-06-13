import { Component, OnInit, ViewChild, ViewContainerRef, WritableSignal, signal } from '@angular/core';
import { LeagueStatus } from '../_models/league';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '@/_services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { faSearchPlus, faSearchMinus, IconDefinition, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { combineLatest, firstValueFrom, map, mergeMap, tap } from 'rxjs';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-league',
    templateUrl: './league.component.html',
    styleUrls: ['./league.component.css'],
    providers: [LeagueHttpService],
    imports: [NgStyle, RouterLink]
})
export class LeagueComponent  implements OnInit {

  faSearchPlus: IconDefinition;
  faSearchMinus: IconDefinition;
  faMinusCircle: IconDefinition;

  playerId: number;

  private display: WritableSignal<boolean>;

  private loadingClose: WritableSignal<boolean>;
  private loadingDelete: WritableSignal<boolean>;
  private loadingNotify: WritableSignal<boolean>;

  @ViewChild('leagueContainer', {read: ViewContainerRef}) leagueContainerRef: ViewContainerRef | undefined;
  @ViewChild('notificationContainer', {read: ViewContainerRef}) notificationContainerRef: ViewContainerRef;

  constructor(private readonly leagueHttpService: LeagueHttpService,
              public navigationService: NavigationService,
              public authenticationService: AuthenticationService,
              private readonly router: Router,
              private readonly alertService: AlertService,
              private readonly dialog: MatDialog) {}

  ngOnInit(): void {

    this.display = signal(false);

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.loadingClose  = signal(false);
      this.loadingDelete = signal(false);
      this.loadingNotify = signal(false);

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
          retLeaguelayers.sort((a,b) => a.playerId - b.playerId);
          this.navigationService.players.set(retLeaguelayers);
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

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });



    dialogRef.componentInstance.confirmMessage = $localize`:@@league-DeleteConf:Are you sure you want to delete league with all players and matches results?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadingDelete.set(true)
        this.leagueHttpService.deleteLeague(this.navigationService.league().id).pipe(tap(
          () => {
            this.alertService.success($localize`:@@league-DeleteMsg:League successfully deleted`, true);
            this.loadingDelete.set(false);
            this.navigationService.league.set(undefined);
            this.router.navigate(['mpLeagues']).catch(error => console.log(error));
          })
        ).subscribe();
      }
    });

  }

  closeLeague() : void {

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

    this.navigationService.matches.update(matches => { matches.forEach(match => {
        // update only if winnerNick is undefined (when it is read from database)
        match.winnerNick = match.winnerNick ?? this.navigationService.players().find(player => player.playerId === match.winnerId).nick;
        match.looserNick = match.looserNick ?? this.navigationService.players().find(player => player.playerId === match.looserId).nick;
      })
      return matches;
    });
  }

  sendNotification(): void {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@notifications-PublishConf:Are you sure you want to send notifications to subscribers?`;
    dialogRef.afterClosed()
    .pipe(
      mergeMap((result: boolean) => {
        if (result) {
          this.loadingNotify.set(true);
          return firstValueFrom(this.leagueHttpService.notify(this.navigationService.league().id, this.navigationService.results()).pipe(map(() => true)));
        }
        return Promise.resolve(false);
      })
    ).subscribe((status: boolean) => {
      if (status === true) {
        this.loadingNotify.set(false);
        this.alertService.success($localize`:@@notifications-PublishMsg:Notifications has been sent.`, false);
      }
    });
  }

  async loadComponent(comp: number) {

    if (this.leagueContainerRef !== undefined) {
      this.leagueContainerRef.clear();
    }
    if (this.notificationContainerRef !== undefined) {
      this.notificationContainerRef.clear();
    }

    if (comp === 0) {
      const {LeaguePlayerComponent} = await import('../league-player/league-player.component');
      this.leagueContainerRef.createComponent(LeaguePlayerComponent);
    } else if (comp === 1) {
      const {NotificationComponent} = await import('../notification/notification.component');
      this.notificationContainerRef.createComponent(NotificationComponent);
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

  isLoadingNotify() {
    return this.loadingNotify();
  }
}
