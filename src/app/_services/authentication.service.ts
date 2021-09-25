import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '@/_models';
import { HttpService } from './http.service';
import jwt_decode, { JwtPayload } from 'jwt-decode';

interface MyJwtPayload extends JwtPayload {
    roles: string
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentPlayerSubject: BehaviorSubject<Player>;
  public currentPlayer: Observable<Player>;

  constructor(private httpService: HttpService) {
    this.currentPlayerSubject = new BehaviorSubject<Player>(JSON.parse(localStorage.getItem('currentPlayer')));
    this.currentPlayer = this.currentPlayerSubject.asObservable();
  }

  public get currentPlayerValue(): Player {
    return this.currentPlayerSubject.value;
  }

  public get playerRole(): string {

    if (this.currentPlayerValue === null) {
      return '';
    }

    return (jwt_decode(this.currentPlayerSubject.value.token) as MyJwtPayload).roles;
  }


  login(username: string, password: string) {

    return this.httpService.authenticate(username, password)
      .pipe(map(response => {
        const player: Player = response.body;
        player.token =  response.headers.get('Jwt');
        player.refreshToken = response.headers.get('Refresh');

        localStorage.setItem('currentPlayer', JSON.stringify(player));
        this.currentPlayerSubject.next(player);
        return player;
      }));
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentPlayer');
    this.currentPlayerSubject.next(null);
  }
}
