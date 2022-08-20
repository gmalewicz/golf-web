import { TournamentRound } from './../_models/tournamentRound';
import { TournamentHttpService } from './../_services/tournamentHttp.service';
import { Course } from '@/_models/course';
import { Player } from '@/_models/player';
import { Round } from '@/_models/round';
import { ScoreCard } from '@/_models/scoreCard';
import { Tee, teeTypes } from '@/_models/tee';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faCheckCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, Subscription, timer } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Tournament } from '../_models/tournament';
import { getDateAndTime } from '@/_helpers/common';
import { Hole } from '@/_models/hole';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-round',
  templateUrl: './add-round.component.html',
  styleUrls: ['./add-round.component.css']
})
export class AddRoundComponent implements OnInit, OnDestroy  {

  // parent data who call me
  data: {course: Course, tournament: Tournament};

  faSearchPlus: IconDefinition;
  faCheckCircle: IconDefinition;

  display: boolean;

  defRoundForm: FormGroup;
  player: Player;
  tee: number;
  holes: Hole[];
  teeOptionsMale = [];
  teeOptionsFemale = [];
  tees: Tee[] = [];

  course: Course;
  tournament: Tournament;

  submitted: boolean;
  searchInProgress: boolean;

  score: string[];
  first9Total: number;
  last9Total: number;
  grandTotal: number;

  tournamentRounds: TournamentRound[] = [];

  teeHour: number;
  teeMinute: number;

  subscription: Subscription;
  seconds: number;
  stoppedCounter: boolean;

  constructor(private formBuilder: FormBuilder,
              private alertService: AlertService,
              private httpService: HttpService,
              private tournamentHttpService: TournamentHttpService,
              private router: Router) { }

  ngOnInit(): void {

    if (history.state.data === undefined || history.state.data.tournament === undefined || history.state.data.course === undefined) {
      this.router.navigate(['/home']);
    } else {
      this.display = false;

      this.faSearchPlus = faSearchPlus;
      this.faCheckCircle = faCheckCircle;
      this.tournament = history.state.data.tournament;
      this.course = history.state.data.course;
      this.stoppedCounter = true;
      this.seconds = 0;

      this.defRoundForm = this.formBuilder.group({
        teeDropDown: ['', [Validators.required]],
        nick: ['', [Validators.required, Validators.maxLength(20)]]
      });

      this.clear();

      combineLatest([this.httpService.getHoles(this.course.id),
                    this.httpService.getTees(this.course.id)]).pipe(tap(
        ([retHoles, retTees]) => {
          // update teee with missing infromation about holes and tees
          this.holes = retHoles;
          this.tees = retTees;

          retTees
            .filter((t) => t.sex && t.teeType === teeTypes.TEE_TYPE_18)
            .forEach(t =>
              this.teeOptionsFemale.push({
                label: t.tee,
                value: t.id,
              })
            );
          retTees
            .filter((t) => !t.sex && t.teeType === teeTypes.TEE_TYPE_18)
            .forEach(t =>
              this.teeOptionsMale.push({
                label: t.tee,
                value: t.id,
              })
            );
          this.display = true;
        })
      ).subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

   // convenience getter for easy access to form fields
   get f() {
    return this.defRoundForm.controls;
  }

  onSearchPlayer() {
    this.alertService.clear();

    if (this.f.nick.valid) {

      this.searchInProgress = true;

      this.httpService
      .getPlayerForNick(this.f.nick.value)
      .pipe(
        tap((player) => {
          if (player != null) {
            this.f.nick.disable();
            this.player = player;
          } else {
            this.alertService.error($localize`:@@addRound-plrNotFnd:Player ${this.f.nick.value} not found.`, false);
          }
          this.searchInProgress = false;
        })
      )
      .subscribe();
    }
  }

  getTeeOptions(): any[] {
    if (this.player !== undefined) {
      const retVal = this.player.sex
        ? this.teeOptionsFemale
        : this.teeOptionsMale;

      this.tee = this.f.teeDropDown.value;

      return retVal;
    }
  }

  // change which 9 is available when tee has been changed
  teeChange() {
    this.alertService.clear();
    // set up the tee for the player based on the drop down tee
    this.tee = this.f.teeDropDown.value;
  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }

  onKey(text: string, i: number) {

    this.alertService.clear();

    if (text.search('^(1[0-5]|[1-9]|x)$') === -1) {
      this.score[i] = '';
    }
    this.calculateTotals();
  }

  calculateTotals() {

    if (this.score.slice(0, 9).includes('x')) {
      this.first9Total = -1;
    } else {
      this.first9Total = this.score.slice(0, 9).map(s => +s).reduce((p, n) => p + n);
    }

    if (this.score.slice(9, 18).includes('x')) {
      this.last9Total = -1;
    } else {
      this.last9Total = this.score.slice(9, 18).map(s => +s).reduce((p, n) => p + n);
    }

    if (this.first9Total === -1 || this.last9Total === -1) {
      this.grandTotal = -1;
    } else {
      this.grandTotal = this.first9Total + this.last9Total;
    }
  }

  clear() {
    this.score =  Array(18).fill('');
    this.first9Total = 0;
    this.last9Total = 0;
    this.grandTotal = 0;
    this.player = undefined;
    this.tee = null;
    this.f.nick.setValue(undefined);
    this.f.nick.enable();
  }

  addRound() {
    // first check if all holes has been added
    if  (this.score.includes('')) {
      this.alertService.error($localize`:@@addRound-allHls:All holes must be filled`, false);
      return;
    }

    if  (this.player === undefined || this.tee === null) {
      this.alertService.error($localize`:@@addRound-noNck:Player nick and tee must be selected`, false);
      return;
    }

    // create round object
    const scoreCard: ScoreCard[] = [];

    for (let hole = 0; hole < 18; hole++) {

      let stroke: number;
      if (this.score[hole] === 'x') {
        stroke = 16;
      } else {
        stroke = +this.score[hole];
      }

      scoreCard.push({hole: hole + 1, stroke, pats: 0, penalty: 0});
    }

    const dateStr = getDateAndTime();

    const round: Round = {
      course: this.course,
      roundDate: dateStr[0] + ' ' + dateStr[1],
      // prepare player with only required data
      player: [this.player],
      scoreCard,
      matchPlay: false
    };

    // only selected tee shall be sent, so replace entire list with selected tee
    round.course.tees =  this.tees.filter(t => t.id === this.tee);

    this.tournamentHttpService.addRoundonBehalf(round, this.tournament.id).pipe(tap(
      (tournamentRound) => {
        tournamentRound.nick = this.player.nick;

        // it is not set on backend
        if (this.score.includes('x')) {
          tournamentRound.strokes = false;
        }

        this.tournamentRounds.push(tournamentRound);
        this.clear();
        this.resetCounter();
        this.stoppedCounter = false;
      })
    ).subscribe();
  }

  private resetCounter() {

    const startDate = new Date();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = timer(0, 1000)
    .subscribe(() => {
      this.seconds = Math.floor((new Date().getTime() - startDate.getTime()) / 1000);
      if (this.seconds >= 60) {
        this.stoppedCounter = true;
      }
    });
  }
}

