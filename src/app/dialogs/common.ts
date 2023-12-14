import { Player } from '@/_models';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RegisterPlayerDialogComponent } from './register-player-dialog/register-player-dialog.component';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@/_services/http.service';

export function findOrCreatePlayer(player: Player, dialog: MatDialog): Promise<Player>{

  console.log(player);
  if (player?.action) {
    console.log(player);
    const dialogConfig = new MatDialogConfig();
    console.log(player);
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      nick: '',
    };
    console.log(player);
    const dialogRef = dialog.open(
      RegisterPlayerDialogComponent,
      dialogConfig
    );
    console.log(player);
    return firstValueFrom(dialogRef.afterClosed());
  // indicate that it is an existing player
  } else if (player !== undefined) {
    player.action = "notNew";
    return Promise.resolve(player);
  }
  // player cancelled search
  return Promise.resolve(player);
}

export function savePlayer(player: Player, httpService: HttpService): Promise<Player> {

  if (player !== undefined && player.action === undefined) {
    let whs: string = player.whs + '';
    whs = whs.toString().replace(/,/gi, '.');

    const newPlayer: Player = {
      nick: player.nick,
      whs: +whs,
      sex: player.female === true
    };
    // save new player in backend and return that player to the next step
    return firstValueFrom(httpService.addPlayerOnBehalf(newPlayer));
  }

  return Promise.resolve(player);
}

