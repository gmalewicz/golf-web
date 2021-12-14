import { PlayerRndCnt } from './../../_models/playerRndCnt';
import { routing } from '@/app.routing';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit } from '@angular/core';
import { HttpService } from '@/_services/http.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html'
})
export class PlayersComponent implements OnInit {

  playerRoundCntEmt: EventEmitter<PlayerRndCnt[]> = new EventEmitter();

  display: boolean;
  playerRound: PlayerRndCnt[];

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {

    this.display = false;

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
}

@NgModule({
  declarations: [PlayersComponent],
  imports: [CommonModule, routing]
})
class ResetPasswordModule {}
