import { PlayerRndCnt } from './../../_models/playerRndCnt';

import { Component, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { tap, finalize } from 'rxjs/operators';
import { faMinusCircle, faCircleArrowDown, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Player } from '@/_models/player';
import { AlertService } from '@/_services/alert.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { UpdDialogComponent } from './upd-dialog/upd-dialog.component';
import { PzgIdDialogComponent } from './pzg-id-dialog/pzg-id-dialog.component';
import { RouterLink } from '@angular/router';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';

@Component({
    selector: 'app-players',
    templateUrl: './players.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FaIconComponent, RouterLink, LoadingDirective]
})
export class PlayersComponent implements OnInit {
  private readonly httpService = inject(HttpService);
  private readonly dialog = inject(MatDialog);
  private readonly alertService = inject(AlertService);
  private readonly authenticationService = inject(AuthenticationService);

  playerRoundCntEmt: EventEmitter<PlayerRndCnt[]> = new EventEmitter();

  loading: boolean;
  display: boolean;
  playerRound: PlayerRndCnt[];

  faMinusCircle: IconDefinition;
  faArrowDown: IconDefinition = faCircleArrowDown;
  readonly pzgUpdating = new Set<number>();

  ngOnInit(): void {

    this.loading = false;
    this.display = false;
    this.faMinusCircle = faMinusCircle;

    if (this.playerRound !== undefined) {
      this.display = true;
      return;
    }


    this.httpService.getPlayerRoundCnt().pipe(
      tap(
        pr => {
          this.display = true;
          this.playerRound = pr;
          this.playerRoundCntEmt.emit(pr);
        })
    ).subscribe();
  }

  onClickDelete(id: number) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete that player permanently. This operation cannot be reversed!';
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do confirmation actions
        this.loading = true;
        this.httpService.deletePlayer(id).pipe(tap(
          () => {
            this.loading = false;
            this.playerRound = this.playerRound.filter(pr => pr.id !== id);
            this.playerRoundCntEmt.emit(this.playerRound);
          })
        ).subscribe();
      }
    });
  }

  onClickPzgId(idx: number) {

    const row = this.playerRound[idx];
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      nick: row.nick,
      pzgId: row.pzgId
    };

    const dialogRef = this.dialog.open(PzgIdDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        const pzgId: number | null = result.pzgId;
        this.httpService.updatePlayerPzgId(row.id, pzgId).pipe(tap(
          () => {
            row.pzgId = pzgId;
            this.alertService.success('The player ' + row.nick + ' PZG ID has been successfully updated', false);
          })
        ).subscribe();
      }
    });
  }

  // Keep the logged-in player's handicap (title bar, new round) in sync when it is edited here
  private syncCurrentPlayerWhs(playerId: number, whs: number) {
    const currentPlayer = this.authenticationService.currentPlayerValue;
    if (currentPlayer?.id === playerId) {
      currentPlayer.whs = whs;
      this.authenticationService.updateStorage();
    }
  }

  onClickPzgHcp(idx: number, event: Event) {

    event.stopPropagation();

    const row = this.playerRound[idx];
    if (this.pzgUpdating.has(row.id)) {
      return;
    }

    this.pzgUpdating.add(row.id);
    this.httpService.updatePlayerWhsFromPzg(row.id).pipe(
      finalize(() => this.pzgUpdating.delete(row.id)),
      tap(
        result => {
          row.whs = result.whs;
          this.syncCurrentPlayerWhs(row.id, result.whs);
          this.alertService.success('The player ' + row.nick + ' handicap has been successfully updated from PZG to ' + result.whs, false);
        })
    ).subscribe();
  }

  onClickUpdate(id: number) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      nick: this.playerRound[id].nick,
      whs: this.playerRound[id].whs,
      sex: this.playerRound[id].sex,
    };

    const dialogRef = this.dialog.open(
      UpdDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {

        const whs = result.whs.toString().replaceAll(',', '.');

        const player: Player = {
          id: this.playerRound[id].id,
          whs: +whs,
          nick: result.nick,
          sex: result.female === true
        };
        this.httpService.updatePlayerOnBehalf(player).pipe(tap(
          () => {
            this.playerRound[id].whs = +whs;
            this.syncCurrentPlayerWhs(player.id, +whs);
            this.playerRound[id].sex = result.female;
            this.playerRound[id].nick = result.nick;
            this.alertService.success('The player ' +  this.playerRound[id].nick + ' has been successfully updated', false);
          })
        ).subscribe();
      }
    });
  }
}


