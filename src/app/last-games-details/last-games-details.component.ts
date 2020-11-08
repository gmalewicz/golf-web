import { Component, OnInit } from '@angular/core';
import { Game, GameSendData } from '@/_models';
import { HttpService, AlertService, AuthenticationService } from '@/_services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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

  public mailItForm: FormGroup;

  constructor(private httpService: HttpService,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private router: Router,
              private authenticationService: AuthenticationService) {

  }

  // convenience getter for easy access to form fields
  get f() { return this.mailItForm.controls; }


  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.mailIt = false;
      this.submitted = false;
      this.loading = false;
      this.game = history.state.data.game;
      this.mailItForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]]
      });
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

    this.httpService.sendGame(gameSendData).subscribe(data => {
      // console.log(data);
      this.alertService.success('The game data sent to ' + this.f.email.value, true);
      this.router.navigate(['/']);
    },
    (error: HttpErrorResponse) => {
      // console.log(error.error.message);
      this.alertService.error(error.error.message, true);
      this.loading = false;
      this.router.navigate(['/']);
    });

  }

}
