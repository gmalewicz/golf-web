import { ChangeDetectorRef, Component, OnInit, WritableSignal, signal } from '@angular/core';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { IconDefinition, faMinusCircle, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { NavigationService } from '../_services/navigation.service';
import { tap } from 'rxjs';
import { LeaguePlayer } from '../_models/leaguePlayer';
import { Player } from '@/_models/player';
import { ConfirmationDialogComponent } from '@/confirmation-dialog/confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { generateDisplayResults } from '../_helpers/common';


@Component({
  selector: 'app-league-player',
  standalone: true,
  imports: [CommonModule,
            FontAwesomeModule,
            ReactiveFormsModule],
  templateUrl: './league-player.component.html',
 // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaguePlayerComponent implements OnInit {

  faMinusCircle: IconDefinition;
  faSearchPlus: IconDefinition;

  private submitted: WritableSignal<boolean>;
  private display: WritableSignal<boolean>;
  private searchPlayerInProgress: WritableSignal<boolean>;
  private deletePlayerInProgress: WritableSignal<boolean>;

  public players: LeaguePlayer[] = [];


  searchPlayerForm: FormGroup;

  playerIdx: number;

  constructor(private leagueHttpService: LeagueHttpService,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private httpService: HttpService,
              private dialog: MatDialog,
              public navigationService: NavigationService,

              private ref: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.faMinusCircle = faMinusCircle;
    this.faSearchPlus = faSearchPlus;

    this.submitted = signal(false);
    this.display = signal(false);
    this.deletePlayerInProgress = signal(false);
    this.searchPlayerInProgress = signal(false);

    this.searchPlayerForm = this.formBuilder.group({
      nick: ['', [Validators.required, Validators.maxLength(20)]]
    });

    this.display.set(true);
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

   // convenience getter for easy access to form fields
   get f() {
    return this.searchPlayerForm.controls;
  }

  onSearchPlayer() {
    this.alertService.clear();

    this.submitted.set(true);

    // stop here if form is invalid
    if (this.searchPlayerForm.invalid) {
      return;
    }

    // verify if player has been already added to the tournament
    if (this.navigationService.players().find(p => p.nick === this.f.nick.value)) {
      this.alertService.error($localize`:@@leaguePlr-plrAlrdAdded:Player ${this.f.nick.value} already added to the league.`, false);
      this.submitted.set(false);
      this.searchPlayerForm.reset();
      return;
    }

    this.searchPlayerInProgress.set(true);

    this.httpService.getPlayerForNick(this.f.nick.value).pipe(
      tap((player: Player) => {

        if (player != null) {

          const leaguePlayer: LeaguePlayer = {
            playerId: player.id,
            league: this.navigationService.league(),
            nick: player.nick
          };

          this.leagueHttpService.addLeaguePlayer(leaguePlayer).pipe(
            tap(() => {

                this.submitted.set(false);
                this.searchPlayerForm.reset();
                // sort players and save
                this.navigationService.players.set(this.navigationService.players().concat(leaguePlayer).sort((a,b) => a.playerId - b.playerId));
                // recalculate results
                this.navigationService.matchesForDisplay.set(generateDisplayResults(this.navigationService.matches(), this.navigationService.players()));
                this.searchPlayerInProgress.set(false);
                this.ref.detectChanges();
            })
          ).subscribe();

        } else {
          this.alertService.error($localize`:@@leaguePlr-plrNotFnd:Player ${this.f.nick.value} not found.`, false);
          this.submitted.set(false);
          this.searchPlayerForm.reset();
          this.searchPlayerInProgress.set(false);
          this.ref.detectChanges();
        }
      })
    ).subscribe();

  }

  deletePlayer(leaguePlayer: LeaguePlayer, playerIdx: number) {

    // first check if player has associated any match and display proper error
    if (this.navigationService.matches().find(m => m.winnerId === leaguePlayer.id || m.looserId === leaguePlayer.id)) {
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
