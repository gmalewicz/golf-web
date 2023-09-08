import { Injectable } from '@angular/core';
import { LeaguePlayer } from '../_models/leaguePlayer';
import { League } from '../_models/league';

@Injectable()
export class NavigationService {

  private league: League;
  private leaguePlayers: LeaguePlayer[];

  constructor() {}

  setLeague(league: League) {
    this.league = league;
  }

  getLeague(): League {
    return this.league;
  }

  setLeaguePlayers(leaguePlayers: LeaguePlayer[]) {
    this.leaguePlayers = leaguePlayers;
  }

  getLeaguePlayers(): LeaguePlayer[] {
    return this.leaguePlayers;
  }

  clear() {
    this.league = undefined;
    this.leaguePlayers = undefined;
  }
}


