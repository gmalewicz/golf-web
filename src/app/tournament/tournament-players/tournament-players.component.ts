
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Player } from '@/_models/player';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinusCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom, map, mergeMap, tap } from 'rxjs';
import { UpdateTournamentPlayerWhsDialogComponent } from '../update-tournament-player-whs-dialog/update-tournament-player-whs-dialog.component';
import { TournamentPlayer } from '../_models/tournamentPlayer';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CreateOrSearchDialogBase } from '@/dialogs/create-or-search-dialog-base';
import { TournamentNavigationService } from '../_services';

@Component({
    selector: 'app-tournament-players',
    imports: [CommonModule,
        FontAwesomeModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCheckboxModule],
    templateUrl: './tournament-players.component.html',
    styleUrls: ['./tournament-players.component.css']
})
export class TournamentPlayersComponent extends CreateOrSearchDialogBase implements OnInit {

  display: boolean;

  faMinusCircle: IconDefinition;
  faSearchPlus: IconDefinition;

  updWhsInProgress: boolean;
  playerIdx: number;

  deletePlayerinProgress: boolean;

  constructor(private readonly tournamentHttpService: TournamentHttpService,
              protected alertService: AlertService,
              protected httpService: HttpService,
              protected dialog: MatDialog,
              public navigationService: TournamentNavigationService) {
                super(alertService, dialog, httpService);
              }

  ngOnInit(): void {

    this.faMinusCircle = faMinusCircle;
    this.faSearchPlus = faSearchPlus;

    this.display = false;

    if (this.navigationService.tournamentPlayers() == undefined) {

      this.tournamentHttpService.getTournamentPlayers(this.navigationService.tournament().id).pipe(
        tap(
          (retTournamentPlayers: TournamentPlayer[]) => {
            this.navigationService.tournamentPlayers.set(retTournamentPlayers);
            this.display = true;
          })
      ).subscribe();
    } else {
      this.display = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected processPlayer(player: Player, playerIdx: number): Promise<unknown> {
    if (player !== undefined) {
      if (this.navigationService.tournamentPlayers().find(p => p.nick === player.nick)) {
        this.alertService.error($localize`:@@tourPlr-plrAlrdAdded:Player ${player.nick} already added to the tournament.`, false);
        return Promise.resolve(undefined);
      }

      const tournamentPlayer: TournamentPlayer = {
        playerId: player.id,
        whs: player.whs,
        tournamentId: this.navigationService.tournament().id,
        nick: player.nick,
        sex: player.sex
      };

      // send tournament player to backend
      return firstValueFrom(this.tournamentHttpService.addTournamentPlayer(tournamentPlayer).pipe(map(() => tournamentPlayer)));
    }
    // here must be undefined
    return Promise.resolve(undefined);
  }

  protected processPostPlayer(tournamentPlayer: unknown): void {
    if (tournamentPlayer !== undefined) {
      this.navigationService.tournamentPlayers.update(players => [...players, tournamentPlayer as TournamentPlayer])
    }
  }


  deletePlayer(tournamentPlayer: TournamentPlayer, playerIdx: number) {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@tourPlr-delPlr:Are you sure you want to remove player from tournamnet?`;
    dialogRef.afterClosed()
      .pipe(
        mergeMap((result: boolean) => {
          if (result)
            if (this.navigationService.tournamentResults().map(tr => tr.player.id).includes(tournamentPlayer.playerId)) {
              this.alertService.error($localize`:@@tourPlr-delFail:There are results for player. Please remove them first`, false);
              return Promise.resolve(false);
            } else {
              this.deletePlayerinProgress = true;
              this.playerIdx = playerIdx;
              return firstValueFrom(this.tournamentHttpService.deleteTournamentPlayer(tournamentPlayer.tournamentId, tournamentPlayer.playerId).pipe(map(() => true)));
            }
          return Promise.resolve(false);
        })
      ).subscribe((status: boolean) => {
        if (status === true) {
          this.alertService.success($localize`:@@tourPlr-delSucc:Player successfuly deleted`, false);
          this.navigationService.tournamentPlayers.update(players => [...players.filter(tp => tp.playerId !== tournamentPlayer.playerId)]);
          this.deletePlayerinProgress = false;
        }
    });
  }




  updateWHS(playerIdx: number) {

    if (!this.navigationService.tournament().canUpdateHcp && 
        this.navigationService.tournamentResults().map(tr => tr.player.id).includes(this.navigationService.tournamentPlayers()[playerIdx].playerId)) {
      this.alertService.error($localize`:@@tourPlr-delFail:There are results for player. Please remove them first`, false);
      return;
    }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      player: this.navigationService.tournamentPlayers()[playerIdx]
    };

    const dialogRef = this.dialog.open(
      UpdateTournamentPlayerWhsDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {

        this.updWhsInProgress = true;
        this.playerIdx = playerIdx;

        let whs: string = result.whs;
        whs = whs.toString().replace(/,/gi, '.');
        this.navigationService.tournamentPlayers()[playerIdx].whs = +whs;

        this.tournamentHttpService.updateTournamentPlayer(this.navigationService.tournamentPlayers()[playerIdx]).pipe(
          tap(() => {
            // tslint:disable-next-line: max-line-length
            this.alertService.success($localize`:@@tourPlr-hcpUpdated:HCP for ${this.navigationService.tournamentPlayers()[playerIdx].nick} has been updated`, false);
            this.updWhsInProgress = false;
          })
        ).subscribe();
      }
    });
  }
}
