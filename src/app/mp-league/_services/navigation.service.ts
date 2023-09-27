import { Injectable, computed, signal } from '@angular/core';
import { LeaguePlayer } from '../_models/leaguePlayer';
import { League } from '../_models/league';
import { LeagueMatch } from '../_models/leagueMatch';
import { generateDisplayResults, generateResults } from '../_helpers/common';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  public league = signal<League>(undefined);
  //public results = computed(() => generateResults(this.matches));
  public matches = signal<LeagueMatch[]>([]);
  public players = signal<LeaguePlayer[]>([]);
  public matchesForDisplay  = computed(() => generateDisplayResults(this.matches, this.players));
  public results = computed(() => generateResults(this.matches, this.players));

  constructor() {}

  init() {
    this.matches.set([]);
    this.players.set([]);
  }
}


