import { PlayerRndCnt } from './../../_models/playerRndCnt';
import { routing } from '@/app.routing';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit } from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { tap } from 'rxjs/operators';
import { faMinusCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Player } from '@/_models/player';
import { AlertService } from '@/_services/alert.service';
import { UpdDialogComponent } from './upd-dialog/upd-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html'
})
export class PlayersComponent implements OnInit {

  playerRoundCntEmt: EventEmitter<PlayerRndCnt[]> = new EventEmitter();

  loading: boolean;
  display: boolean;
  playerRound: PlayerRndCnt[];

  faMinusCircle: IconDefinition;

  // dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  constructor(private httpService: HttpService,
              private dialog: MatDialog,
              private alertService: AlertService) { }

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

        const whs = result.whs.toString().replace(/,/gi, '.');

        const player: Player = {
          id: this.playerRound[id].id,
          whs: +whs,
          nick: result.nick,
          sex: result.female === true
        };
        this.httpService.updatePlayerOnBehalf(player).pipe(tap(
          () => {
            this.playerRound[id].whs = +whs;
            this.playerRound[id].sex = result.female;
            this.playerRound[id].nick = result.nick;
            this.alertService.success('The player ' +  this.playerRound[id].nick + ' has been successfully updated', false);
          })
        ).subscribe();
      }
    });
  }
}

@NgModule({
  declarations: [PlayersComponent],
  imports: [CommonModule, routing,  FontAwesomeModule, ReactiveFormsModule ,MatInputModule, MatCheckboxModule, MatDialogModule]
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ResetPasswordModule {}
