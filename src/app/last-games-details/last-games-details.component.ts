import { Component, OnInit } from '@angular/core';
import { Game } from '@/_models';
import { GameService } from '@/_services';

@Component({
  selector: 'app-last-games-details',
  templateUrl: './last-games-details.component.html',
  styleUrls: ['./last-games-details.component.css']
})
export class LastGamesDetailsComponent implements OnInit {

  game: Game;

  constructor(private gameService: GameService) {

    this.game = gameService.getGame();
  }

  ngOnInit(): void {

  }

}
