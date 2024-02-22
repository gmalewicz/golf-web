import { TeeTimeParameters } from '../_models/teeTimeParameters';
import { Tournament } from '@/tournament/_models/tournament';
import { TournamentPlayer } from '@/tournament/_models/tournamentPlayer';
import { Injectable, computed, signal } from '@angular/core';
import { TournamentResult } from '../_models';
import { generateTeeTimes } from '../_helpers/common';

@Injectable({ providedIn: 'root' })
export class TournamentNavigationService {

  public loadTeeTimesFlag = false;
  public teeTimesChecked = signal<boolean>(false);

  public tournamentPlayers = signal<TournamentPlayer[]>(null);
  public tournament = signal<Tournament>(undefined);
  public teeTimeParameters = signal<TeeTimeParameters>(undefined);
  public teeTimes = computed(() => {
    if (this.loadTeeTimesFlag) {
      this.loadTeeTimesFlag = false;
      return this.teeTimeParameters().teeTimes
    } else {
      return generateTeeTimes(this.teeTimeParameters, this.tournamentPlayers)
    }
  });
  public tournamentResults = signal<TournamentResult[]>(undefined);

  init() {
    this.tournamentPlayers.set(undefined);
    this.teeTimeParameters.set(undefined);
    this.teeTimesChecked.set(false);
    this.tournamentResults.set(undefined);
  }

}


