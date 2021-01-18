import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService} from '@/_services';

@Component({
  selector: 'app-bbb-game-setup',
  templateUrl: './bbb-game-setup.component.html',
  styleUrls: ['./bbb-game-setup.component.css']
})
export class BbbGameSetupComponent implements OnInit {

  players: number;
  stake: number;
  gameType: string;

  constructor(private router: Router,
              private authenticationService: AuthenticationService) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {
      this.players = 4;
      this.stake = 0.3;
      this.gameType = 'bbbGame';
    }
  }

  onPlayers(players: number): void {
    // console.log('players: ' + players);
    this.players = players;
  }

  onStake(stake: number): void {
    // console.log('stake: ' + stake);
    this.stake = stake;
  }
}
