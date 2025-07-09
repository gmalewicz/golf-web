import { NavigationService } from './../_services/navigation.service';
import { getDateAndTime } from '@/_helpers/common';
import { Course, Player, Tee, TeeOptions } from '@/_models';
import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { faCheckCircle, faSearchPlus, IconDefinition} from '@fortawesome/free-solid-svg-icons';
import { combineLatest, tap } from 'rxjs';
import { UpdateWhsDialogComponent } from '../update-whs-dialog/update-whs-dialog.component';
import { OnlineRound } from '../_models/onlineRound';
import { ScorecardHttpService } from '../_services';
import { CreateOrSearchDialogBase } from '@/dialogs/create-or-search-dialog-base';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-online-round-def',
    templateUrl: './online-round-def.component.html',
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        NgClass,
        FaIconComponent,
        MatSelect,
        MatOption,
        RouterLink
    ],
    providers: [NavigationService]
})
export class OnlineRoundDefComponent extends CreateOrSearchDialogBase implements OnInit {

  courseSgn = signal<Course>(undefined);
  displaySgn = signal(false);
  loadingSgn = signal(false);
  noOfPlayersSgn = signal<number>(undefined);
  playersSgn = signal<Player[]>(undefined);
  searchInProgressSgn = signal<boolean[]>(undefined);
  faSearchPlusSgn = signal<IconDefinition>(undefined);
  faCheckCircleSgn = signal<IconDefinition>(undefined);

  defScoreCardForm: FormGroup;  
  teeOptionsMale: TeeOptions[] = [];
  teeOptionsFemale: TeeOptions[] = [];
  tees: Tee[];
  selectedTeeOption: TeeOptions | undefined

  constructor(
    protected httpService: HttpService,
    private readonly scorecardHttpService: ScorecardHttpService,
    private readonly formBuilder: FormBuilder,
    protected alertService: AlertService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    protected dialog: MatDialog,
    private readonly navigationService: NavigationService
  ) {
    super(alertService, dialog, httpService);
    }

  ngOnInit(): void {
    if (
      history.state.data === undefined ||
      this.authenticationService.currentPlayerValue === null
    ) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      // initialization
      this.displaySgn.set(false);
      this.loadingSgn.set(false);
      this.noOfPlayersSgn.set(1);
      this.playersSgn.set(Array(4));
      this.tees = Array(4);
      this.faSearchPlusSgn.set(faSearchPlus);
      this.faCheckCircleSgn.set(faCheckCircle);
      this.searchInProgressSgn.set(Array(4).fill(false));
      this.getCourseData();
    }
  }

  private getCourseData() {
    // grab course from the history
    this.courseSgn.set(history.state.data.course);

    // initiate player with logged in player
    this.playersSgn()[0] = this.authenticationService.currentPlayerValue;
    this.playersSgn.set([...this.playersSgn()]); // trigger change detection
    

    // form definition
    this.defScoreCardForm = this.formBuilder.group({
      teeTime: [
        getDateAndTime()[1],
        [
          Validators.required,
          Validators.pattern('^([0-1][0-9]|[2][0-3]):([0-5][0-9])$'),
        ],
      ],
      teeDropDown1: ['', [Validators.required]],
      teeDropDown2: [{ value: '', disabled: true }, [Validators.required]],
      teeDropDown3: [{ value: '', disabled: true }, [Validators.required]],
      teeDropDown4: [{ value: '', disabled: true }, [Validators.required]],
      putts: [false],
      penalties: [false],
      matchPlay: [false],
      mpFormat: ['0.75', Validators.required]
    });



    // clean up all controls;
    this.onPlayers(1);

    // get course holes and available tees
    combineLatest([
      this.httpService.getHoles(this.courseSgn().id),
      this.httpService.getTees(this.courseSgn().id),
    ]).subscribe(([retHoles, retTees]) => {
      // update teee with missing infromation about holes and tees
      this.courseSgn().holes = retHoles;
      this.courseSgn().tees = retTees;

      // create tee labels
      const teeType = ['1-18', '1-9', '10-18'];
      retTees
        .filter((t) => t.sex)
        // tslint:disable-next-line: variable-name
        .forEach(t =>
          this.teeOptionsFemale.push({
            label: t.tee + ' ' + teeType[t.teeType],
            value: t.id,
          })
        );
      retTees
        .filter((t) => !t.sex)
        // tslint:disable-next-line: variable-name
        .forEach(t =>
          this.teeOptionsMale.push({
            label: t.tee + ' ' + teeType[t.teeType],
            value: t.id,
          })
        );

      this.displaySgn.set(true);
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.defScoreCardForm.controls;
  }

  get teeDropDown1() { return this.defScoreCardForm.get("teeDropDown") }

  // change which 9 is available when tee has been changed
  teeChange(index: number) {

    // set up the tee for the player based on the drop down tee
    switch (index) {
      case 0: {
        this.tees[index] = this.courseSgn().tees
          // tslint:disable-next-line: variable-name
          .filter(t => t.id === this.f.teeDropDown1.value)
          .pop();
        break;
      }
      case 1: {
        this.tees[index] = this.courseSgn().tees
          // tslint:disable-next-line: variable-name
          .filter(t => t.id === this.f.teeDropDown2.value)
          .pop();
        break;
      }
      case 2: {
        this.tees[index] = this.courseSgn().tees
          // tslint:disable-next-line: variable-name
          .filter(t => t.id === this.f.teeDropDown3.value)
          .pop();
        break;
      }
      default: {
        this.tees[index] = this.courseSgn().tees
          // tslint:disable-next-line: variable-name
          .filter(t => t.id === this.f.teeDropDown4.value)
          .pop();
        break;
      }
    }
  }

  onStartOnlineRound() {

    this.f.teeDropDown1.markAsTouched();
    this.f.teeDropDown2.markAsTouched();
    this.f.teeDropDown3.markAsTouched();
    this.f.teeDropDown4.markAsTouched();
    this.f.teeTime.markAsTouched();

    this.f.teeDropDown1.updateValueAndValidity();

    // stop here if form is invalid
    if (this.defScoreCardForm.invalid) {
      return;
    }

    // stop here if players where not verified in database
    if (!this.isAllNicksSet()) {
      this.alertService.error(
        $localize`:@@onlnRndDef-lookForPlrs:Please use loupe for remaning players to verify them. Each player needs to be greayed out before proceeding.`, false
      );
      return;
    }

    if (this.f.matchPlay.value && !this.isMpTeeTypeCorrect()) {
      return;
    }

    this.loadingSgn.set(true);

    const onlineRounds: OnlineRound[] = Array(this.noOfPlayersSgn());

    let counter = 0;
    while (counter < this.noOfPlayersSgn()) {
      const onlineRound: OnlineRound = {
        course: this.courseSgn(),
        teeTime: this.f.teeTime.value,
        player: this.playersSgn()[counter],
        tee: this.tees[counter],
        owner: this.playersSgn()[0].id,
        finalized: false,
        putts: this.f.putts.value,
        penalties: this.f.penalties.value,
        matchPlay: this.f.matchPlay.value,
        // required not to filter on frontend on view page
        nick2: ''
      };

      if (this.f.matchPlay.value) {
        onlineRound.nick2 = this.playersSgn()[1].nick;
        onlineRound.mpFormat = this.f.mpFormat.value;
      }

      onlineRounds[counter] = onlineRound;
      counter++;
    }

    this.scorecardHttpService
      .addOnlineRounds(onlineRounds)
      .pipe(
        tap((or) => {
          this.loadingSgn.set(false);
          this.navigationService.setCourseSgn(this.courseSgn);
          this.navigationService.setOnlineRoundsSgn(signal(or));
          if (this.f.matchPlay.value) {
            this.router.navigate(['/scorecard/onlineMatchplay']).catch(error => console.log(error));
          } else {
            this.router.navigate(['/scorecard/onlineRound']).catch(error => console.log(error));
          }
        })
      )
      .subscribe();
  }

  private isAllNicksSet(): boolean {
    return !this.playersSgn().slice(0, this.noOfPlayersSgn()).includes(undefined);
  }

  onPlayers(players: number) {
    this.noOfPlayersSgn.set(players);

    switch (players) {
      case 1: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.disable();
        this.f.teeDropDown3.disable();
        this.f.teeDropDown4.disable();
        break;
      }
      case 2: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.enable();
        this.f.teeDropDown3.disable();
        this.f.teeDropDown4.disable();
        break;
      }
      case 3: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.enable();
        this.f.teeDropDown3.enable();
        this.f.teeDropDown4.disable();
        break;
      }
      case 4: {
        this.f.teeDropDown1.enable();
        this.f.teeDropDown2.enable();
        this.f.teeDropDown3.enable();
        this.f.teeDropDown4.enable();
        break;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected processPostPlayer(player: unknown): void {
    // This is intentional
  }

  protected processPlayer(player: Player, playerIdx: number): Promise<Player> {

    if (player !== undefined) {

      // verify if player is not already added
      if (this.isNickDuplicated(player.nick)) {
        return Promise.resolve(undefined);
      }

      this.playersSgn()[playerIdx] = player;
      this.playersSgn.set([...this.playersSgn()]); // trigger change detection
    }
    // here must be undefined - all actions if any performed before
    return Promise.resolve(undefined);
  }

  onMatchPlayChange(e) {
    if (e) {
      this.onPlayers(2);
      this.noOfPlayersSgn.set(2);
    }
  }

  private isMpTeeTypeCorrect(): boolean {
    if (this.tees[0].teeType !== this.tees[1].teeType) {
      this.alertService.error(
        $localize`:@@onlnRndDef-holeNotRight:Tee types (number of holes) for both players must be the same in case of MP round`,
        false
      );
      return false;
    }
    return true;
  }

  private isNickDuplicated(nick: string): boolean {
    let retVal = false;

    for (const p of this.playersSgn()) {
      if (p !== undefined && nick === p.nick) {
        this.alertService.error(
          $localize`:@@onlnRndDef-PlrNotUnique:Player must be unique in the single score card`,
          false
        );
        retVal = true;
        break;
      }
    }

    return retVal;
  }

  getTeeOptions(idx: number): TeeOptions[] {
    if (this.playersSgn()[idx] !== undefined) {
      return this.playersSgn()[idx].sex
        ? this.teeOptionsFemale
        : this.teeOptionsMale;
    }
  }

  updateWHS(playerIdx: number) {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      player: this.playersSgn()[playerIdx]
    };

    const dialogRef = this.dialog.open(
      UpdateWhsDialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {

        const player: Player = this.playersSgn()[playerIdx];

        let whs: string = result.whs;
        whs = whs.toString().replace(/,/gi, '.');
        player.whs = +whs;
        this.searchInProgressSgn()[playerIdx] = true;
        this.searchInProgressSgn.set([...this.searchInProgressSgn()]); // trigger change detection

        // update owner
        if (playerIdx === 0) {
          this.httpService
          .updatePlayer(player)
          .pipe(
            tap(() => {
              this.playersSgn()[playerIdx] = player;
              this.playersSgn.set([...this.playersSgn()]); // trigger change detection
              this.searchInProgressSgn()[playerIdx] = false;
              this.searchInProgressSgn.set([...this.searchInProgressSgn()]); // trigger change detection
            })
          )
          .subscribe();
          // update other player
        } else {

          this.httpService
          .updatePlayerOnBehalf(player)
          .pipe(
            tap(() => {
              this.playersSgn()[playerIdx] = player;
              this.playersSgn.set([...this.playersSgn()]); // trigger change detection
              this.searchInProgressSgn()[playerIdx] = false;
              this.searchInProgressSgn.set([...this.searchInProgressSgn()]); // trigger change detection
            })
          )
          .subscribe();
        }
      }
    });
  }
}



