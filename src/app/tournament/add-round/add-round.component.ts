import { AutoTabDirective } from './AutoTab.directive';
import { TournamentRound } from './../_models/tournamentRound';
import { TournamentHttpService } from './../_services/tournamentHttp.service';
import { Course } from '@/_models/course';
import { Player } from '@/_models/player';
import { Round } from '@/_models/round';
import { ScoreCard } from '@/_models/scoreCard';
import { Tee, teeTypes } from '@/_models/tee';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { faCheckCircle, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Tournament } from '../_models/tournament';
import { getDateAndTime } from '@/_helpers/common';
import { Hole } from '@/_models/hole';
import { Router, RouterModule } from '@angular/router';
import { TeeOptions } from '@/_models/teeOptions';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RangePipe } from "../../_helpers/range";

@Component({
    selector: 'app-add-round',
    imports: [RouterModule,
    MatSelectModule,
    CommonModule,
    ReactiveFormsModule,
    AutoTabDirective,
    FontAwesomeModule,
    FormsModule, RangePipe],
    providers: [TournamentHttpService],
    templateUrl: './add-round.component.html',
    styleUrls: ['./add-round.component.css']
})
export class AddRoundComponent implements OnInit {

  // parent data who call me
  data: {course: Course, tournament: Tournament};

  faCheckCircle: IconDefinition;

  display: boolean;

  defRoundForm: FormGroup;
  player: Player;
  tee: number;
  holes: Hole[];
  teeOptionsMale: TeeOptions[] = [];
  teeOptionsFemale: TeeOptions[] = [];
  tees: Tee[] = [];

  course: Course;
  tournament: Tournament;

  submitted: boolean;

  score: string[];
  first9Total: number;
  last9Total: number;
  grandTotal: number;

  tournamentRounds: TournamentRound[] = [];

  teeHour: number;
  teeMinute: number;

  tournamentPlayersOptions = [];

  searchInProgress: boolean;

  constructor(private readonly formBuilder: FormBuilder,
              private readonly alertService: AlertService,
              private readonly httpService: HttpService,
              private readonly tournamentHttpService: TournamentHttpService,
              private readonly router: Router) { }

  ngOnInit(): void {

    if (history.state.data === undefined || history.state.data.tournament === undefined || history.state.data.course === undefined) {
      this.router.navigate(['/home']).catch(error => console.log(error));
    } else {
      this.display = false;
      this.faCheckCircle = faCheckCircle;
      this.tournament = history.state.data.tournament;
      this.course = history.state.data.course;

      this.defRoundForm = this.formBuilder.group({
        nickDropDown : ['', [Validators.required]],
        teeDropDown: ['', [Validators.required]]
      });

      this.clear();

      combineLatest([this.httpService.getHoles(this.course.id),
                    this.httpService.getTees(this.course.id),
                    this.tournamentHttpService.getTournamentPlayers(this.tournament.id)]).pipe(tap(
        ([retHoles, retTees, retTournamentPlayers]) => {
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

          retTournamentPlayers.forEach(t => {
            this.tournamentPlayersOptions.push({
              label: t.nick,
              value: t.nick,
            });
          });

          this.display = true;
        })
      ).subscribe();
    }
  }

   // convenience getter for easy access to form fields
   get f() {
    return this.defRoundForm.controls;
  }

  nickChange() {

    if (this.f.nickDropDown.valid) {

      this.searchInProgress = true;

      this.httpService
      .getPlayerForNick(this.f.nickDropDown.value)
      .pipe(
        tap((player) => {
          if (player != null) {
            this.f.nickDropDown.disable();
            this.player = player;
          } else {
            this.alertService.error($localize`:@@addRound-plrNotFnd:Player ${this.f.nickDropDown.value} not found.`, false);
          }
          this.searchInProgress = false;
        })
      )
      .subscribe();
    }
  }

  getTeeOptions(): TeeOptions[] {
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
    // set up the tee for the player based on the drop down tee
    this.tee = this.f.teeDropDown.value;
    this.f.teeDropDown.disable();
  }

  onKey(text: string, i: number) {

    if (text.search('^(1[0-5]|[1-9]|x)$') === -1) {
      this.score[i] = '';
    }
    this.calculateTotals();
  }

  calculateTotals() {

    if (this.score.slice(0, 9).includes('x')) {
      this.first9Total = -1;
    } else {
      this.first9Total = this.score.slice(0, 9).map(s => +s).reduce((p, n) => p + n, 0);
    }

    if (this.score.slice(9, 18).includes('x')) {
      this.last9Total = -1;
    } else {
      this.last9Total = this.score.slice(9, 18).map(s => +s).reduce((p, n) => p + n, 0);
    }

    if (this.first9Total === -1 || this.last9Total === -1) {
      this.grandTotal = -1;
    } else {
      this.grandTotal = this.first9Total + this.last9Total;
    }
  }

  clear() {

    // mark that tee data have been submitted
    this.defRoundForm.markAsUntouched();

    this.score =  Array(18).fill('');
    this.first9Total = 0;
    this.last9Total = 0;
    this.grandTotal = 0;
    this.player = undefined;
    this.tee = null;
    this.f.nickDropDown.setValue(undefined);
    this.f.nickDropDown.enable();
    this.f.teeDropDown.enable();
    this.submitted = false;
  }

  addRound() {


    // mark that tee data have been submitted
    this.defRoundForm.markAllAsTouched();

    this.submitted = true;

    // stop here if form is invalid
    if (this.defRoundForm.invalid) {
      return;
    }

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
        this.submitted = false;
      })
    ).subscribe();
  }
}

