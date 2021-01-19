import { AuthenticationService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html'
})
export class GameSetupComponent implements OnInit {

  players: number;
  stake: number;
  // 1 - hole stake
  // 2 - bingo bango bongo
  game: number;
  gameType: number;
  gameTitle: string;
  stakes: number[];

  public nickSetupForm: FormGroup;

  submitted: boolean;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.game = history.state.data.game;
      if (this.game === 1) {
        this.gameType = 1;
        this.gameTitle = 'Hole Stake Game Set Up';
        this.stakes = [3, 6, 9];
      } else {
        this.gameType = 2;
        this.gameTitle = 'Bingo, Bango, Bongo Set Up';
        this.stakes = [0.3, 0.6, 0.9];

      }
      this.stake = this.stakes[0];
      this.players = 4;

      this.nickSetupForm = this.formBuilder.group({
        player1: [this.authenticationService.currentPlayerValue.nick, [Validators.required, Validators.maxLength(10)]],
        player2: ['P2', [Validators.required, Validators.maxLength(10)]],
        player3: ['P3', [Validators.required, Validators.maxLength(10)]],
        player4: ['P4', [Validators.required, Validators.maxLength(10)]]
      });
      this.submitted = false;
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.nickSetupForm.controls; }

  onPlayers(players: number): void {
    // console.log('players: ' + players);
    this.players = players;
  }

  onStake(stake: number): void {
    // console.log('stake: ' + stake);
    this.stake = this.stakes[stake];
  }

  onSubmit(): void {
    // console.log('start game');
    this.submitted = true;

    if (this.nickSetupForm.invalid) {
      return;
    }

    const playerNicks: string[] = [];
    playerNicks.push(this.f.player1.value);
    playerNicks.push(this.f.player2.value);
    if (this.players > 2) {
      playerNicks.push(this.f.player3.value);
    }
    if (this.players > 3) {
      playerNicks.push(this.f.player4.value);
    }

    this.router.navigate(['bingoHolestakeGames'], {
      relativeTo: this.route.parent,
      state: {  data: { playersNo: this.players,
                        stake: this.stake,
                        players: playerNicks,
                        gameType: this.gameType } }
    });
  }

}
