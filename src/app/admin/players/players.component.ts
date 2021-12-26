import { PlayerRndCnt } from './../../_models/playerRndCnt';
import { routing } from '@/app.routing';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit } from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { tap } from 'rxjs/operators';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons/faMinusCircle';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';

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

  dialogRef: MatDialogRef<ConfirmationDialogComponent>;

  constructor(private httpService: HttpService,
              private dialog: MatDialog) { }

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
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    this.dialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete that player permanently. This operation cannot be reversed!';
    this.dialogRef.afterClosed().subscribe(result => {
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
      this.dialogRef = null;
    });
  }
}

@NgModule({
  declarations: [PlayersComponent],
  imports: [CommonModule, routing,  FontAwesomeModule, ReactiveFormsModule]
})
class ResetPasswordModule {}
