import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService} from '@/_services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hole-stake-setup',
  templateUrl: './hole-stake-setup.component.html'
})
export class HoleStakeSetupComponent implements OnInit {

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
      this.gameType = 'holeStakeGame';
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
