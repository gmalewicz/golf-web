import { Injectable, signal } from '@angular/core';
import { LeaguePlayer } from '../_models/leaguePlayer';
import { League } from '../_models/league';
import { LeagueMatch } from '../_models/leagueMatch';
import { Result } from '../_models/result';
import { DisplayMatch } from '../_models';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  public league = signal<League>(undefined);
  public results = signal<Result[]>([]);
  public matches = signal<LeagueMatch[]>([]);
  public players = signal<LeaguePlayer[]>([]);
  public matchesForDisplay = signal<DisplayMatch[][]>([]);

  constructor() {}

  init() {
    console.log('initialization executed');
    this.matches.set([]);
    this.results.set([]);
    this.players.set([]);
    this.matchesForDisplay.set([]);
  }


}


