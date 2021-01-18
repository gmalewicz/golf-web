import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-setup-players',
  templateUrl: './game-setup-players.component.html'
})
export class GameSetupPlayersComponent implements OnInit {

  @Input() public onPlayers: (players: number) => void;

  constructor() { }

  ngOnInit(): void {
  }

}
