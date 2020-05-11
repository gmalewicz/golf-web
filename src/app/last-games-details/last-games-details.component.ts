import { Component, OnInit } from '@angular/core';
import { Game, GameSendData } from '@/_models';
import { GameService, HttpService, AlertService } from '@/_services';
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
  mailIt = false;
  submitted = false;
  loading = false;

  public mailItForm: FormGroup;

  constructor(private gameService: GameService,
              private httpService: HttpService,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private router: Router) {

    this.game = gameService.getGame();
  }

  // convenience getter for easy access to form fields
  get f() { return this.mailItForm.controls; }


  ngOnInit(): void {
    this.mailItForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

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
      console.log(data);
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
