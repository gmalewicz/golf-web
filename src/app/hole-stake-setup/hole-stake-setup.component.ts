import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hole-stake-setup',
  templateUrl: './hole-stake-setup.component.html',
  styleUrls: ['./hole-stake-setup.component.css']
})
export class HoleStakeSetupComponent implements OnInit {

  players = 3;
  stake = 3;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onPlayers(players: number): void {
    console.log('players: ' + players);
    this.players = players;
  }

  onStake(stake: number): void {
    console.log('stake: ' + stake);
    this.stake = stake;
  }

  onStart(): void {
    console.log('start game');
    this.router.navigate(['holeStakeGame', this.players, this.stake]);
  }

}
