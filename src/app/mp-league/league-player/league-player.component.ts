import { LeaguePlayer } from './../_models/leaguePlayer';
import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { IconDefinition, faMinusCircle, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { map, tap, firstValueFrom } from 'rxjs';
import { Player } from '@/_models/player';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthenticationService } from '@/_services/authentication.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CreateOrSearchDialogBase } from '@/dialogs/create-or-search-dialog-base';

@Component({
  selector: 'app-league-player',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './league-player.component.html',
})
export class LeaguePlayerComponent extends CreateOrSearchDialogBase implements OnInit {

  faMinusCircle: IconDefinition;
  faSearchPlus: IconDefinition;

  private display: WritableSignal<boolean>;
  private deletePlayerInProgress: WritableSignal<boolean>;

  public players: LeaguePlayer[] = [];

  playerIdx: number;
  player: Player;

  constructor(private readonly leagueHttpService: LeagueHttpService,
              protected alertService: AlertService,
              protected httpService: HttpService,
              protected dialog: MatDialog,
              public navigationService: NavigationService,
              private readonly authenticationService: AuthenticationService) {
                super(alertService, dialog, httpService);
              }

  ngOnInit(): void {
    this.faMinusCircle = faMinusCircle;
    this.faSearchPlus = faSearchPlus;

    this.display = signal(false);
    this.deletePlayerInProgress = signal(false);
    this.display.set(true);
    this.player = this.authenticationService.currentPlayerValue;
  }

  isDisplayed() {
    return this.display();
  }

  isDeletePlayerInProgress() {
    return this.deletePlayerInProgress();
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected processPlayer(player: Player, playerIdx: number): Promise<unknown> {
    if (player !== undefined) {
      if (this.navigationService.players().find(p => p.nick === player.nick)) {
        this.alertService.error($localize`:@@leaguePlr-plrAlrdAdded:Player ${player.nick} already added to the league.`, false);
        return Promise.resolve(undefined);
      }

      const leaguePlayer: LeaguePlayer = {
        playerId: player.id,
        league: this.navigationService.league(),
        nick: player.nick
      };

      // send league player to backend
      return firstValueFrom(this.leagueHttpService.addLeaguePlayer(leaguePlayer).pipe(map(() => leaguePlayer)));
    }
    // here must be undefined
    return Promise.resolve(undefined);
  }

  protected processPostPlayer(leaguePlayer: unknown) {
    if (leaguePlayer !== undefined) {
      // sort players and save
      this.navigationService.players.set(this.navigationService.players().concat(leaguePlayer as LeaguePlayer).sort((a,b) => a.playerId - b.playerId));
    }
  }

  deletePlayer(leaguePlayer: LeaguePlayer, playerIdx: number) {

    // first check if player has associated any match and display proper error
    if (this.navigationService.matches().find(m => m.winnerId === leaguePlayer.playerId || m.looserId === leaguePlayer.playerId)) {
      this.alertService.error($localize`:@@leaguePlr-delFailure:Cannot delete player with matches. Delete all player matches first.`, false);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@leaguePlr-delPlr:Are you sure you want to remove player from league?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deletePlayerInProgress.set(true);
        this.playerIdx = playerIdx;
        this.leagueHttpService.deleteLeaguePlayer(leaguePlayer.league.id, leaguePlayer.playerId).pipe(
          tap(
            () => {
              this.alertService.success($localize`:@@leaguePlr-delSucc:Player successfuly deleted`, false);
              this.navigationService.players.set(...[this.navigationService.players().filter(lp => lp.playerId !== leaguePlayer.playerId)]);
              this.players = this.navigationService.players();
              this.deletePlayerInProgress.set(false);
            })
        ).subscribe();
      }
    })
  }
}
