import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService} from '@/_services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-hole-stake-setup',
  templateUrl: './hole-stake-setup.component.html',
  styleUrls: ['./hole-stake-setup.component.css']
})
export class HoleStakeSetupComponent implements OnInit {

  public holeGameSetupForm: FormGroup;
  submitted: boolean;
  loading: boolean;

  players: number;
  stake: number;

  constructor(private router: Router,
              private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.submitted = false;
      this.loading = false;
      this.players = 4;
      this.stake = 3;

      this.holeGameSetupForm = this.formBuilder.group({
        player1: [this.authenticationService.currentPlayerValue.nick, [Validators.required, Validators.maxLength(10)]],
        player2: ['P2', Validators.required],
        player3: ['P3', Validators.required],
        player4: ['P4', Validators.required]
      });
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

  onSubmit(): void {
    // console.log('start game');
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

    this.router.navigate(['holeStakeGame'], {
      relativeTo: this.route.parent,
      state: {  data: { playersNo: this.players,
                        stake: this.stake,
                        players: playerNicks } }
    });


  }

  // convenience getter for easy access to form fields
  get f() { return this.holeGameSetupForm.controls; }

}
