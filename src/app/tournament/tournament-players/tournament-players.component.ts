
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Player } from '@/_models/player';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinusCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subject, map, mergeMap, tap } from 'rxjs';
import { UpdateTournamentPlayerWhsDialogComponent } from '../update-tournament-player-whs-dialog/update-tournament-player-whs-dialog.component';
import { Tournament } from '../_models/tournament';
import { TournamentPlayer } from '../_models/tournamentPlayer';
import { TournamentResult } from '../_models/tournamentResult';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { SearchPlayerDialogComponent } from '@/dialogs/search-player-dialog/search-player-dialog.component';
import { RegisterPlayerDialogComponent } from '@/dialogs/register-player-dialog/register-player-dialog.component';


@Component({
  selector: 'app-tournament-players',
  standalone: true,
  imports: [CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule],
  templateUrl: './tournament-players.component.html',
  styleUrls: ['./tournament-players.component.css']
})
export class TournamentPlayersComponent implements OnInit {

  display: boolean;

  @Input() tournament: Tournament;
  @Input() tournamentPlayers: TournamentPlayer[];
  @Input() tournamentResults: TournamentResult[];

  outTournamentPlayers = new Subject<TournamentPlayer[]>();

  faMinusCircle: IconDefinition;
  faSearchPlus: IconDefinition;

  updWhsInProgress: boolean;
  playerIdx: number;

  deletePlayerinProgress: boolean;

  submitted: boolean;

  constructor(private tournamentHttpService: TournamentHttpService,
              private alertService: AlertService,
              private httpService: HttpService,
              private dialog: MatDialog) {}

  ngOnInit(): void {

    this.faMinusCircle = faMinusCircle;
    this.faSearchPlus = faSearchPlus;

    this.submitted = false;

    this.display = false;

    if (this.tournamentPlayers === undefined) {

      this.tournamentHttpService.getTournamentPlayers(this.tournament.id).pipe(
        tap(
          (retTournamentPlayers: TournamentPlayer[]) => {
            this.tournamentPlayers = retTournamentPlayers;
            this.display = true;
            this.outTournamentPlayers.next(this.tournamentPlayers);
          })
      ).subscribe();
    } else {
      this.display = true;
    }
  }

   onSearchPlayer() {
    this.alertService.clear();

    this.submitted = true;

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(
      SearchPlayerDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed()
      .pipe(
        mergeMap(player => {
          // user decided to create the new player so open the proper dialog
          if (player?.action) {

            const dialogConfig = new MatDialogConfig();

            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = true;
            dialogConfig.data = {
              nick: '',
            };

            const dialogRef = this.dialog.open(
              RegisterPlayerDialogComponent,
              dialogConfig
            );

            return dialogRef.afterClosed();
          // indicate that it is an existing player
          } else if (player !== undefined) {
            player.action = "notNew";
            return Promise.resolve(player);
          }
          // player cancelled search
          return Promise.resolve(player);
        }),
        // create new player if required
        mergeMap(player => {

          if (player !== undefined && player.action === undefined) {
            let whs: string = player.whs;
            whs = whs.toString().replace(/,/gi, '.');

            const newPlayer: Player = {
              nick: player.nick,
              whs: +whs,
              sex: player.female === true
            };
            // save new player in backend and return that player to the next step
            return this.httpService.addPlayerOnBehalf(newPlayer);
          }

          return Promise.resolve(player);
        }),
        mergeMap(player => {
          if (player !== undefined) {
            if (this.tournamentPlayers.find(p => p.nick === player.nick)) {
              this.alertService.error($localize`:@@tourPlr-plrAlrdAdded:Player ${player.nick} already added to the tournament.`, false);
              return Promise.resolve(undefined);
            }

            const tournamentPlayer: TournamentPlayer = {
              playerId: player.id,
              whs: player.whs,
              tournamentId: this.tournament.id,
              nick: player.nick
            };

            // send tournament player to backend
            return this.tournamentHttpService.addTournamentPlayer(tournamentPlayer).pipe(map(() => tournamentPlayer));
          }
          // here must be undefined
          return Promise.resolve(undefined);
        })
      ).subscribe((tournamentPlayer) => {
        if (tournamentPlayer !== undefined) {
          this.tournamentPlayers.push(tournamentPlayer);
          this.outTournamentPlayers.next(this.tournamentPlayers);
        }
        this.submitted = false;
      });
  }

  deletePlayer(tournamentPlayer: TournamentPlayer, playerIdx: number) {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@tourPlr-delPlr:Are you sure you want to remove player from tournamnet?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do confirmation actions
        if (this.tournamentResults.map(tr => tr.player.id).includes(tournamentPlayer.playerId)) {
          this.alertService.error($localize`:@@tourPlr-delFail:There are results for player. Please remove them first`, false);
        } else {
          this.deletePlayerinProgress = true;
          this.playerIdx = playerIdx;
          this.tournamentHttpService.deleteTournamentPlayer(tournamentPlayer.tournamentId, tournamentPlayer.playerId).pipe(
            tap(
              () => {
                this.alertService.success($localize`:@@tourPlr-delSucc:Player successfuly deleted`, false);
                this.tournamentPlayers = this.tournamentPlayers.filter(tp => tp.playerId !== tournamentPlayer.playerId);
                this.outTournamentPlayers.next(this.tournamentPlayers);
                this.deletePlayerinProgress = false;
              })
          ).subscribe();
        }
      }
    });
  }

  updateWHS(playerIdx: number) {

    if (this.tournamentResults.map(tr => tr.player.id).includes(this.tournamentPlayers[playerIdx].playerId)) {
      this.alertService.error($localize`:@@tourPlr-delFail:There are results for player. Please remove them first`, false);
      return;
    }

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      player: this.tournamentPlayers[playerIdx]
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
        this.tournamentPlayers[playerIdx].whs = +whs;

        this.tournamentHttpService.updateTournamentPlayer(this.tournamentPlayers[playerIdx]).pipe(
          tap(() => {
            // tslint:disable-next-line: max-line-length
            this.alertService.success($localize`:@@tourPlr-hcpUpdated:HCP for ${this.tournamentPlayers[playerIdx].nick} has been updated`, false);
            this.updWhsInProgress = false;
          })
        ).subscribe();
      }
    });
  }
}
