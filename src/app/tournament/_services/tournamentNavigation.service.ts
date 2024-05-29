import { TeeTimeParameters } from '../_models/teeTimeParameters';
import { Tournament } from '@/tournament/_models/tournament';
import { TournamentPlayer } from '@/tournament/_models/tournamentPlayer';
import { Injectable, computed, signal } from '@angular/core';
import { TeeTime, TeeTimeModification, TournamentResult } from '../_models';
import { updateTeeTimes } from '../_helpers/common';

@Injectable({ providedIn: 'root' })
export class TournamentNavigationService {

  public modification = false;
  public loadTeeTimesFlag = false;

  public teeTimesChecked = signal<boolean>(false);
  public teeTimeModification = signal<TeeTimeModification>({});
  public tournamentPlayers = signal<TournamentPlayer[]>(null);
  public tournament = signal<Tournament>(undefined);
  public teeTimeParameters = signal<TeeTimeParameters>(undefined);
  public teeTimes = computed(() => {

    const teeTimes: TeeTime[] = updateTeeTimes(this.teeTimeParameters(),
                                               this.tournamentPlayers(),
                                               this.tournamentResults(),
                                               this.teeTimeModification(),
                                               this.modification,
                                               this.loadTeeTimesFlag);
    this.modification = false;
    //this.loadTeeTimesFlag = false;

    return teeTimes;

  });

  public tournamentResults = signal<TournamentResult[]>(undefined);

  init() {
    this.tournamentPlayers.set(undefined);
    this.teeTimeParameters.set(undefined);
    this.teeTimesChecked.set(false);
    this.tournamentResults.set(undefined);
    this.modification = false;
    this.loadTeeTimesFlag = false;
  }

}


