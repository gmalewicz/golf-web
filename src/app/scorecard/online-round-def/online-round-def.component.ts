import { Course, Player, Tee } from '@/_models';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faCheckCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ScorecardHttpService } from '../_services';

@Component({
  selector: 'app-online-round-def',
  templateUrl: './online-round-def.component.html',
  styleUrls: ['./online-round-def.component.css']
})
export class OnlineRoundDefComponent implements OnInit {

  course: Course;
  defScoreCardForm: FormGroup;
  teeOptions = [];
  display: boolean;
  submitted: boolean;
  loading: boolean;
  noOfPlayers: number;
  players: Player[];
  tees: Tee[];

  faSearchPlus: IconDefinition;
  faCheckCircle: IconDefinition;

  constructor(private httpService: HttpService,
              private scorecardHttpService: ScorecardHttpService,
              private formBuilder: FormBuilder,
              private alertService: AlertService,
              private authenticationService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {

    if (history.state.data === undefined || this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      // initialization
      this.display = false;
      this.submitted = false;
      this.loading = false;
      this.noOfPlayers = 1;
      this.players = Array(4);
      this.tees = Array(4);
      this.faSearchPlus = faSearchPlus;
      this.faCheckCircle = faCheckCircle;

      this.getCourseData();
    }
  }

  private getCourseData() {

    // grab course from the history
    this.course = history.state.data.course;

    // initiate player with logged in player
    this.players[0] = this.authenticationService.currentPlayerValue;

    // form definition
    this.defScoreCardForm = this.formBuilder.group({
      teeTime: ['', [Validators.required, Validators.pattern('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$')]],
      teeDropDown1: ['', [Validators.required]],
      teeDropDown2: ['', [Validators.required]],
      teeDropDown3: ['', [Validators.required]],
      teeDropDown4: ['', [Validators.required]],
      nick1: [{value: this.authenticationService.currentPlayerValue.nick, disabled: true}],
      nick2: ['', [Validators.required, Validators.maxLength(10)]],
      nick3: ['', [Validators.required, Validators.maxLength(10)]],
      nick4: ['', [Validators.required, Validators.maxLength(10)]],
      putts: [false],
      penalties: [false],
      matchPlay: [false],
    });

    // clean up all controls;
    this.onPlayers(1);

    // get course holes and available tees
    combineLatest([this.httpService.getHoles(this.course.id),
    this.httpService.getTees(this.course.id)]).subscribe(([retHoles, retTees]) => {

      // update teee with missing infromation about holes and tees
      this.course.holes = retHoles;
      this.course.tees = retTees;

      // create tee labels
      const teeType = ['1-18', '1-9', '10-18'];
      retTees.forEach((t, i) => this.teeOptions.push({ label: t.tee + ' ' + teeType[t.teeType], value: t.id }));

      this.display = true;
      // },
      //  (error: HttpErrorResponse) => {
      //    this.alertService.error(error.error.message, false);
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.defScoreCardForm.controls; }

  // change which 9 is available when tee has been changed
  teeChange(index: number) {

    // set up the tee for the player based on the drop down tee
    switch (index) {
      case 0: {
        this.tees[index] = this.course.tees.filter((t, i) => t.id === this.f.teeDropDown1.value).pop();
        break;
      }
      case 1: {
        this.tees[index] = this.course.tees.filter((t, i) => t.id === this.f.teeDropDown2.value).pop();
        break;
      }
      case 2: {
        this.tees[index] = this.course.tees.filter((t, i) => t.id === this.f.teeDropDown3.value).pop();
        break;
      }
      default: {
        this.tees[index] = this.course.tees.filter((t, i) => t.id === this.f.teeDropDown4.value).pop();
        break;
      }
    }
  }

  onStartOnlineRound() {


    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.defScoreCardForm.invalid) {
      return;
    }

    // stop here if players where not verified in database
    if (!this.isAllNicksSet()) {
      this.alertService.
        error('Please use loupe for remaning players to verify them. Each player needs to be greayed out before proceeding.');
      return;
    }

    if (this.f.matchPlay.value && !this.isMpTeeTypeCorrect()) {
      return;
    }

    this.loading = true;

    const onlineRounds = Array(this.noOfPlayers);

    let counter = 0;
    while (counter < this.noOfPlayers) {

      const onlineRound = {
        course: this.course,
        teeTime: this.f.teeTime.value,
        player: this.players[counter],
        tee: this.tees[counter],
        owner: this.players[0].id,
        finalized: false,
        putts: this.f.putts.value,
        penalties: this.f.penalties.value,
        matchPlay: this.f.matchPlay.value,
        // required not to filter on frontend on view page
        nick2: ''
      };

      if (this.f.matchPlay.value) {
        onlineRound.nick2 = this.players[1].nick;
      }


      onlineRounds[counter] = onlineRound;
      counter++;
    }

    this.scorecardHttpService.addOnlineRounds(onlineRounds).pipe(tap(
      or => {
        this.loading = false;
        if  (this.f.matchPlay.value) {
          this.router.navigate(['/scorecard/onlineMatchplay'], {
            state: { data: { onlineRounds: or, course: this.course } }
          });
        } else {
          this.router.navigate(['/scorecard/onlineRound'], {
            state: { data: { onlineRounds: or, course: this.course } }
          });
        }
      })
    ).subscribe();

  }

  private isAllNicksSet(): boolean {

    return !this.players.slice(0, this.noOfPlayers).includes(undefined);
  }

  onPlayers(players: number) {
    this.noOfPlayers = players;

    switch (players) {
      case 1: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.disable();
        this.f.teeDropDown3.disable();
        this.f.teeDropDown4.disable();
        this.f.nick2.disable();
        this.f.nick3.disable();
        this.f.nick4.disable();
        break;
      }
      case 2: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.enable();
        this.f.teeDropDown3.disable();
        this.f.teeDropDown4.disable();
        this.f.nick2.enable();
        this.f.nick3.disable();
        this.f.nick4.disable();
        break;
      }
      case 3: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.enable();
        this.f.teeDropDown3.enable();
        this.f.teeDropDown4.disable();
        this.f.nick2.enable();
        this.f.nick3.enable();
        this.f.nick4.disable();
        break;
      }
      case 4: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.enable();
        this.f.teeDropDown3.enable();
        this.f.teeDropDown4.enable();
        this.f.nick2.enable();
        this.f.nick3.enable();
        this.f.nick4.enable();
        break;
      }
    }

  }

  onSearchPlayer(playerIdx: number) {

    switch (playerIdx) {
      case 1: {

        if (this.f.nick2.valid) {
          this.searchPlayer(this.f.nick2.value, playerIdx);
        }

        break;
      }

      case 2: {

        if (this.f.nick3.valid) {
          this.searchPlayer(this.f.nick3.value, playerIdx);
        }

        break;
      }

      case 3: {

        if (this.f.nick4.valid) {
          this.searchPlayer(this.f.nick4.value, playerIdx);
        }

        break;
      }
    }
  }

  private searchPlayer(nick: string, playerIdx: number) {

    this.httpService.getPlayerForNick(nick).pipe(tap(
      player => {

        if (player != null) {
          this.players[playerIdx] = player;

          if (playerIdx === 1) {
            this.f.nick2.disable();
          } else if (playerIdx === 2) {
            this.f.nick3.disable();
          } else if (playerIdx === 3) {
            this.f.nick4.disable();
          }
        } else {
          this.alertService.error('Player: ' + nick + ' not found', false);
        }
      })
    ).subscribe();
  }

  onMatchPlayChange(e) {
      if (e) {
        this.onPlayers(2);
        this.noOfPlayers = 2;
      }
  }

  private isMpTeeTypeCorrect(): boolean {
    if (this.tees[0].teeType !== this.tees[1].teeType) {
      this.alertService.error('Tee types (number of holes) for both players must be the same in case of MP round', false);
      return false;
    }
    return true;
  }
}
