import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, GameService } from '@/_services';
import { GameSetup } from '@/_models';

@Component({
  selector: 'app-hole-stake-setup',
  templateUrl: './hole-stake-setup.component.html',
  styleUrls: ['./hole-stake-setup.component.css']
})
export class HoleStakeSetupComponent implements OnInit {

  public holeGameSetupForm: FormGroup;
  submitted = false;
  loading = false;

  players = 4;
  stake = 3;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private gameService: GameService) { }

  ngOnInit(): void {
    this.holeGameSetupForm = this.formBuilder.group({
      player1: [this.authenticationService.currentPlayerValue.nick, [Validators.required, Validators.maxLength(10)]],
      player2: ['P2', Validators.required],
      player3: ['P3', Validators.required],
      player4: ['P4', Validators.required]
    });
  }

  onPlayers(players: number): void {
    console.log('players: ' + players);
    this.players = players;
  }

  onStake(stake: number): void {
    console.log('stake: ' + stake);
    this.stake = stake;
  }

  onSubmit(): void {
    console.log('start game');
    this.submitted = true;

    if (this.holeGameSetupForm.invalid) {
      return;
    }

    this.loading = true;
    const playerNicks: string[] = [];
    playerNicks.push(this.f.player1.value);
    playerNicks.push(this.f.player2.value);
    if (this.players > 2) {
      playerNicks.push(this.f.player3.value);
    }
    if (this.players > 3) {
      playerNicks.push(this.f.player4.value);
    }

    const gameSetup: GameSetup = {
      playersNo: this.players,
      stake: this.stake,
      players: playerNicks
    };

    this.gameService.setGameSetup(gameSetup);

    this.router.navigate(['holeStakeGame']);
  }

  // convenience getter for easy access to form fields
  get f() { return this.holeGameSetupForm.controls; }

}
