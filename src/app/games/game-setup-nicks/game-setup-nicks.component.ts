import { AuthenticationService } from '@/_services/authentication.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-setup-nicks',
  templateUrl: './game-setup-nicks.component.html'
})
export class GameSetupNicksComponent implements OnInit {

  submitted: boolean;
  @Input() players: number;
  @Input() stake: number;
  @Input() gameType: string;

  public nickSetupForm: FormGroup;
  loading: boolean;

  constructor( private formBuilder: FormBuilder,
               private authenticationService: AuthenticationService,
               private router: Router,
               private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.nickSetupForm = this.formBuilder.group({
      player1: [this.authenticationService.currentPlayerValue.nick, [Validators.required, Validators.maxLength(10)]],
      player2: ['P2', [Validators.required, Validators.maxLength(10)]],
      player3: ['P3', [Validators.required, Validators.maxLength(10)]],
      player4: ['P4', [Validators.required, Validators.maxLength(10)]]
    });
    this.submitted = false;
  }

  // convenience getter for easy access to form fields
  get f() { return this.nickSetupForm.controls; }

  onSubmit(): void {
    // console.log('start game');
    this.submitted = true;

    if (this.nickSetupForm.invalid) {
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

    this.router.navigate([this.gameType], {
      relativeTo: this.route.parent,
      state: {  data: { playersNo: this.players,
                        stake: this.stake,
                        players: playerNicks } }
    });
  }
}
