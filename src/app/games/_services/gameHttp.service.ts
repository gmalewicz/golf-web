import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game, GameSendData } from '@/games/_models';
import { Player } from '@/_models/player';

@Injectable()
export class GameHttpService {

  constructor(private http: HttpClient) { }

  addGame(game: Game): Observable<void> {
    return this.http.post<void>('rest/Game', game);
  }

  getGames(player: Player): Observable<Array<Game>> {
    return this.http.get<Array<Game>>('rest/Game/' + player.id);
  }

  sendGame(gameSendData: GameSendData): Observable<void> {
    return this.http.post<void>('rest/SendGame', gameSendData);
  }

}


