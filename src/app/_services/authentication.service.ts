import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '@/_models';
import { HttpService } from './http.service';
import { HttpResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly currentPlayerSubject: BehaviorSubject<Player>;
  public currentPlayer: Observable<Player>;

  constructor(private readonly httpService: HttpService) {
    this.currentPlayerSubject = new BehaviorSubject<Player>(JSON.parse(localStorage.getItem('currentPlayer')));
    this.currentPlayer = this.currentPlayerSubject.asObservable();
  }

  public get currentPlayerValue(): Player {
    return this.currentPlayerSubject.value;
  }

  public get playerRole(): string {

    let roles: string = '';


    if (this.currentPlayerValue === null) {
      return roles;
    }

    if (this.currentPlayerSubject.value.role == 0) {
			roles += 'ROLE_ADMIN,';
		}
		roles += 'ROLE_PLAYER';


    return roles;
  }


  login(username: string, password: string) {

    return this.httpService.authenticate(username, password)
      .pipe(map(response => {
        const player: Player = response.body;

        localStorage.setItem('currentPlayer', JSON.stringify(player));
        this.currentPlayerSubject.next(player);
        return player;
      }));
  }

  loginSocial(player: Player) {

    localStorage.setItem('currentPlayer', JSON.stringify(player));
    this.currentPlayerSubject.next(player);

  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentPlayer');
    this.currentPlayerSubject.next(null);
  }

  // v2.20 update JWT not to break on-line round
  updateJWT(): Observable<HttpResponse<unknown>> {
    return this.httpService.refresh(this.currentPlayerValue.id);
  }

  updateStorage() {
    localStorage.setItem('currentPlayer', JSON.stringify(this.currentPlayerValue));
  }
}
