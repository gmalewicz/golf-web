import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@/_services';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../_models';
import { GameHttpService } from '../_services';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-last-games',
  templateUrl: './last-games.component.html',
  styleUrls: ['./last-games.component.css']
})
export class LastGamesComponent implements OnInit {

  faSearchPlus: IconDefinition;
  display: boolean;

  games: Game[];

  constructor(private gameHttpService: GameHttpService,
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
      this.display = false;
      this.getGames();
    }
  }

  private getGames() {
    this.display = false;
    this.gameHttpService.getGames(this.authenticationService.currentPlayerValue).pipe(
      tap(
        (retGames) => {
          this.games = retGames;
          this.display = true;
        })
    ).subscribe();
  }

  onGame(game: Game) {

    this.router.navigate(['lastGamesDetails'], {
        relativeTo: this.route.parent,
        state: {  data: { game } }
    });
  }
}
