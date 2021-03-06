import { Component, OnInit } from '@angular/core';
import { AlertService, AuthenticationService } from '@/_services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Game, GameSendData } from '../_models';
import { GameHttpService } from '../_services';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-last-games-details',
  templateUrl: './last-games-details.component.html',
  styleUrls: ['./last-games-details.component.css']
})
export class LastGamesDetailsComponent implements OnInit {

  game: Game;
  mailIt: boolean;
  submitted: boolean;
  loading: boolean;
  display: boolean;

  public mailItForm: FormGroup;

  constructor(private gameHttpService: GameHttpService,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private router: Router,
              private authenticationService: AuthenticationService) {

  }

  // convenience getter for easy access to form fields
  get f() { return this.mailItForm.controls; }


  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.display = false;
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {
      this.mailIt = false;
      this.submitted = false;
      this.loading = false;
      this.game = history.state.data.game;
      this.mailItForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]]
      });
      this.display = true;
    }
  }

  onSubmit() {

    this.submitted = true;

    if (this.mailItForm.invalid) {
      return;
    }

    this.loading = true;

    const gameSendData: GameSendData = {
      gameId: this.game.id,
      email: this.f.email.value
    };

    this.gameHttpService.sendGame(gameSendData).pipe(
      tap(
        () => {
          this.alertService.success('The game data sent to ' + this.f.email.value, true);
          this.router.navigate(['/home']);
        })
    ).subscribe();
  }
}
