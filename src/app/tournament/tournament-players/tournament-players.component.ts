import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { Player } from '@/_models/player';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinusCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Subject, tap } from 'rxjs';
import { Tournament } from '../_models/tournament';
import { TournamentPlayer } from '../_models/tournamentPlayer';
import { TournamentHttpService } from '../_services/tournamentHttp.service';

@Component({
  selector: 'app-tournament-players',
  templateUrl: './tournament-players.component.html',
  styleUrls: ['./tournament-players.component.css']
})
export class TournamentPlayersComponent implements OnInit {

  display: boolean;

  @Input() tournament: Tournament;
  @Input() tournamentPlayers: TournamentPlayer[];

  outTournamentPlayers = new Subject<TournamentPlayer[]>();

  faMinusCircle: IconDefinition;
  faSearchPlus: IconDefinition;

  searchPlayerForm: FormGroup;

  searchInProgress: boolean;

  submitted: boolean;

  constructor(private tournamentHttpService: TournamentHttpService,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private httpService: HttpService,
              private dialog: MatDialog) {}

  ngOnInit(): void {

    this.faMinusCircle = faMinusCircle;
    this.faSearchPlus = faSearchPlus;

    this.submitted = false;

    this.searchPlayerForm = this.formBuilder.group({
      nick: ['', [Validators.required, Validators.maxLength(20)]]
    });

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

  onClickUpdate(idx: number): void {}

  onClickDelete(id: number): void {}

  onSearchPlayer() {
    this.alertService.clear();

    this.submitted = true;

    // stop here if form is invalid
    if (this.searchPlayerForm.invalid) {
      return;
    }

    // verify if player has been already added to the tournament
    if (this.tournamentPlayers.find(p => p.nick === this.f.nick.value)) {
      this.alertService.error($localize`:@@addRound-plrAlrdAdded:Player ${this.f.nick.value} already added to the tournament.`, false);
      this.submitted = false;
      this.searchPlayerForm.reset();
      return;
    }

    this.searchInProgress = true;

    this.httpService.getPlayerForNick(this.f.nick.value).pipe(
      tap((player: Player) => {

        if (player != null) {

          const tournamentPlayer: TournamentPlayer = {
            playerId: player.id,
            whs: player.whs,
            tournamentId: this.tournament.id,
            nick: player.nick
          };

          this.tournamentHttpService.addTournamentPlayer(tournamentPlayer).pipe(
            tap(() => {
              this.submitted = false;
              this.searchPlayerForm.reset();
              this.tournamentPlayers.push(tournamentPlayer);
              this.outTournamentPlayers.next(this.tournamentPlayers);
            })
          ).subscribe();
        } else {
          this.alertService.error($localize`:@@addRound-plrNotFnd:Player ${this.f.nick.value} not found.`, false);
          this.submitted = false;
          this.searchPlayerForm.reset();
        }
        this.searchInProgress = false;
      })
    )
    .subscribe();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.searchPlayerForm.controls;
  }

  deletePlayer(tournamentPlayer: TournamentPlayer) {

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.confirmMessage = $localize`:@@tourPlr-delPlr:Are you sure you want to remove player from tournamnet?`;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do confirmation actions
        this.tournamentHttpService.deleteTournamentPlayer(tournamentPlayer.tournamentId, tournamentPlayer.playerId).pipe(
          tap(
            () => {
              this.alertService.success($localize`:@@tourPlr-delSucc:Player successfuly deleted`, false);
              this.tournamentPlayers = this.tournamentPlayers.filter(tp => tp.playerId !== tournamentPlayer.playerId);
              this.outTournamentPlayers.next(this.tournamentPlayers);
            })
        ).subscribe();
      }
    });
  }

}

@NgModule({
  declarations: [TournamentPlayersComponent],
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule]
})
class TournamentPlayersModule {}
