import { Injectable, signal } from '@angular/core';
import { LeaguePlayer } from '../_models/leaguePlayer';
import { League } from '../_models/league';
import { LeagueMatch } from '../_models/leagueMatch';
import { Result } from '../_models/result';

@Injectable()
export class NavigationService {

  private league: League;
  private leaguePlayers: LeaguePlayer[];

  public results = signal<Result[]>([]);
  public matches = signal<LeagueMatch[]>([]);
  public players = signal<LeaguePlayer[]>([]);

  constructor() {}

  setLeague(league: League) {
    this.league = league;
  }

  getLeague(): League {
    return this.league;
  }

  clear() {
    this.league = undefined;
    this.leaguePlayers = undefined;
    this.matches.set([]);
  }

  init() {
    this.matches.set([]);
    this.results.set([]);
  }


}


