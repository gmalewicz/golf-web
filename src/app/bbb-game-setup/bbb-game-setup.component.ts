import { GameSetup } from './../_models/gameSetup';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService, GameService } from '@/_services';

@Component({
  selector: 'app-bbb-game-setup',
  templateUrl: './bbb-game-setup.component.html',
  styleUrls: ['./bbb-game-setup.component.css']
})
export class BbbGameSetupComponent implements OnInit {

  public bbbGameSetupForm: FormGroup;
  submitted = false;
  loading = false;

  players = 4;
  stake = 0.3;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private holeStakeService: GameService) { }

  ngOnInit(): void {
    this.bbbGameSetupForm = this.formBuilder.group({
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

    if (this.bbbGameSetupForm.invalid) {
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

    this.holeStakeService.setGameSetup(gameSetup);

    this.router.navigate(['bbbGame']);
  }

  // convenience getter for easy access to form fields
  get f() { return this.bbbGameSetupForm.controls; }

}
