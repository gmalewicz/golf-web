import { EagleResultSet } from './../_models/eagleResult';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cycle } from '../_models/cycle';
import { CycleTournament } from '../_models/cycleTournament';
import { CycleResult } from '../_models/cycleResult';

@Injectable()
export class CycleHttpService {

  constructor(private http: HttpClient) { }

  // gets cycles
  getCycles(): Observable<Array<Cycle>> {
    return this.http.get<Array<Cycle>>('rest/Cycle');
  }

  // add cycle
  addCycle(cycle: Cycle): Observable<void> {
    return this.http.post<void>('rest/Cycle', cycle);
  }

  // gets cycle tournaments
  getCycleTournaments(cycleId: number): Observable<Array<CycleTournament>> {
    return this.http.get<Array<CycleTournament>>('rest/CycleTournament/' + cycleId);
  }

  // gets eagle results
  getEagleResults(tournamentNo: number): Observable<any> {

    return this.http.get('api/_tournament/livescore/get_livescore?id=' + tournamentNo + '&format=stb_netto&classification=0');
  }

  // push eagle results for calculation
  addCycleTournament(eagleResultSet: EagleResultSet): Observable<void> {

    return this.http.post<void>('rest/CycleTournament', eagleResultSet);
  }

  // gets eagle results
  getCycleResults(cycleId: number): Observable<Array<CycleResult>> {

    return this.http.get<Array<CycleResult>>('rest/CycleResult/' + cycleId);
  }

  // gets eagle results
  closeCycle(cycleId: number): Observable<void> {

    return this.http.patch<void>('rest/CycleClose/' + cycleId, null);
  }

  // delete the last tournament
  deleteLastTournament(cycle: Cycle): Observable<void> {

    return this.http.post<void>('rest/DeleteCycleTournament', cycle);
  }

  // delete the last tournament
  deleteCycle(cycleId: number): Observable<void> {

    return this.http.delete<void>('rest/Cycle/' + cycleId);
  }
}


