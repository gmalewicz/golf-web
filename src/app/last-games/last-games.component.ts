import { getTestBed } from '@angular/core/testing';
import { Component, OnInit } from '@angular/core';
import { Game } from '@/_models';
import { HttpService, AuthenticationService, AlertService, GameService } from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-last-games',
  templateUrl: './last-games.component.html',
  styleUrls: ['./last-games.component.css']
})
export class LastGamesComponent implements OnInit {

  faSearchPlus = faSearchPlus;

  games: Game[];

  constructor(private httpService: HttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private gameService: GameService) {

    this.getGames();

  }

  ngOnInit(): void {
  }

  private getGames() {
    this.httpService.getGames(this.authenticationService.currentPlayerValue).subscribe(retGames => {
      console.log(retGames);
      this.games = retGames;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Getting list of games failed', true);
        this.router.navigate(['/']);
    });
  }

  onGame(game: Game) {
    console.log('game is: ' + game.gameId);
    this.gameService.setGame(game);

    this.router.navigate(['lastGamesDetails']);
  }

}
