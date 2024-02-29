import { AlertService } from "@/_services/alert.service";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { SearchPlayerDialogComponent } from "./search-player-dialog/search-player-dialog.component";
import { mergeMap } from "rxjs";
import { Player } from "@/_models/player";
import { RegisterPlayerDialogComponent } from "./register-player-dialog/register-player-dialog.component";
import { HttpService } from "@/_services/http.service";

export abstract class CreateOrSearchDialogBase {

  constructor(
    protected alertService: AlertService,
    protected dialog: MatDialog,
    protected httpService: HttpService,
  ) {}

  onSearchPlayer(playerIdx: number) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(
      SearchPlayerDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed()
      .pipe(
        mergeMap((player: Player) => {
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
            let whs: string = player.whs + '';
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
        mergeMap((player: Player) => {
          return this.processPlayer(player, playerIdx);
        })
      ).subscribe((postPlayer: unknown) => {
        this.processPostPlayer(postPlayer);
      });
  }

  protected abstract processPlayer(player: Player, playerIdx: number): Promise<unknown>

  protected abstract processPostPlayer(player: unknown): void

}
