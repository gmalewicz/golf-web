import { Component, OnInit } from '@angular/core';
import { AuthenticationService, AlertService} from '@/_services';
import { HttpErrorResponse } from '@angular/common/http';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Game } from '../_models';
import { ActivatedRoute } from '@angular/router';
import { GameHttpService } from '../_services';

@Component({
  selector: 'app-last-games',
  templateUrl: './last-games.component.html',
  styleUrls: ['./last-games.component.css']
})
export class LastGamesComponent implements OnInit {

  faSearchPlus: IconDefinition;

  games: Game[];

  constructor(private gameHttpService: GameHttpService,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {
      this.faSearchPlus = faSearchPlus;
      this.getGames();
    }
  }

  private getGames() {
    this.gameHttpService.getGames(this.authenticationService.currentPlayerValue).subscribe(retGames => {
      // console.log(retGames);
      this.games = retGames;
    },
      (error: HttpErrorResponse) => {
        this.alertService.error('Getting list of games failed', true);
        this.router.navigate(['/']);
    });
  }

  onGame(game: Game) {
    // console.log('game is: ' + game.gameId);
    // this.gameService.setGame(game);

    this.router.navigate(['lastGamesDetails'], {
        relativeTo: this.route.parent,
        state: {  data: { game } }
    });
  }
}
