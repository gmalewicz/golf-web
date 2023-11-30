import { LeaguePlayer } from './../_models/leaguePlayer';
import { ChangeDetectorRef, Component, OnInit, WritableSignal, signal } from '@angular/core';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IconDefinition, faMinusCircle, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { map, mergeMap, tap } from 'rxjs';
import { Player } from '@/_models/player';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthenticationService } from '@/_services/authentication.service';
import { SearchPlayerDialogComponent } from '@/dialogs/search-player-dialog/search-player-dialog.component';
import { RegisterPlayerDialogComponent } from '@/dialogs/register-player-dialog/register-player-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-league-player',
  standalone: true,
  imports: [CommonModule,
            FontAwesomeModule,
            ReactiveFormsModule,
            MatButtonModule,
            MatCheckboxModule
          ],
  templateUrl: './league-player.component.html',
})
export class LeaguePlayerComponent implements OnInit {

  faMinusCircle: IconDefinition;
  faSearchPlus: IconDefinition;

  private submitted: WritableSignal<boolean>;
  private display: WritableSignal<boolean>;
  private searchPlayerInProgress: WritableSignal<boolean>;
  private deletePlayerInProgress: WritableSignal<boolean>;

  public players: LeaguePlayer[] = [];

  playerIdx: number;
  player: Player;

  constructor(private leagueHttpService: LeagueHttpService,
              private alertService: AlertService,
              private httpService: HttpService,
              private dialog: MatDialog,
              public navigationService: NavigationService,
              private authenticationService: AuthenticationService,
              private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.faMinusCircle = faMinusCircle;
    this.faSearchPlus = faSearchPlus;

    this.submitted = signal(false);
    this.display = signal(false);
    this.deletePlayerInProgress = signal(false);
    this.searchPlayerInProgress = signal(false);
    this.display.set(true);
    this.player = this.authenticationService.currentPlayerValue;
  }

  isSubmitted() {
    return this.submitted();
  }

  isDisplayed() {
    return this.display();
  }

  isSearchPlayerInProgress() {
    return this.searchPlayerInProgress();
  }

  isDeletePlayerInProgress() {
    return this.deletePlayerInProgress();
  }

  onSearchPlayer() {
    this.alertService.clear();

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
            return this.leagueHttpService.addLeaguePlayer(leaguePlayer).pipe(map(() => leaguePlayer));
          }
          // here must be undefined
          return Promise.resolve(undefined);
        })
      ).subscribe((leaguePlayer) => {
        if (leaguePlayer !== undefined) {
          // sort players and save
          this.navigationService.players.set(this.navigationService.players().concat(leaguePlayer).sort((a,b) => a.playerId - b.playerId));
        }
      });
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
