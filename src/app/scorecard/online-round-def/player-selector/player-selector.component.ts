import { ChangeDetectionStrategy, Component, OnInit, WritableSignal, input, linkedSignal, signal } from '@angular/core';    
import { MatDialog } from '@angular/material/dialog';  
import { MatOption } from '@angular/material/core';  
import { MatSelect } from '@angular/material/select';  
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';  
import { FaIconComponent } from '@fortawesome/angular-fontawesome';  
import { faCheckCircle, faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';  

  
import { Course, Player, Tee, TeeOptions } from '@/_models';  
import { AlertService, AuthenticationService, HttpService } from '@/_services';  
import { NavigationService } from '@/scorecard/_services/navigation.service';  
import { UpdateWhsDialogComponent } from '@/scorecard/update-whs-dialog/update-whs-dialog.component';  
import { CreateOrSearchDialogBase } from '@/dialogs/create-or-search-dialog-base';  
import { finalize, forkJoin, from, switchMap } from 'rxjs';
import { Format } from '@/scorecard/_models/format';
import { NgClass } from '@angular/common';
import { OnlineRound } from '@/scorecard/_models/onlineRound';
import { getDateAndTime } from '@/_helpers/common';
import { ScorecardHttpService } from '@/scorecard/_services/scorecardHttp.service';
import { Router, RouterModule } from '@angular/router';
import {form, Field, disabled, required, submit} from '@angular/forms/signals';

interface PlayerData {
      teeDropDown1: string,  
      teeDropDown2: string,  
      teeDropDown3: string,  
      teeDropDown4: string,  
      putts: boolean,
      penalties: boolean
}

@Component({  
  selector: 'app-player-selector',  
  templateUrl: './player-selector.component.html',  
  imports: [   
    MatFormField,  
    MatLabel,  
    MatError,  
    FaIconComponent,  
    MatSelect,  
    MatOption, 
    NgClass,
    RouterModule, 
    Field
  ],  
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NavigationService, ScorecardHttpService],  
})  
export class PlayerSelectorComponent extends CreateOrSearchDialogBase implements OnInit {  
 
  private readonly MAX_PLAYERS = 4;

  courseSgn = input.required<Course>();  
  formatSgn = input.required<Format>(); 

  playerDataModel = signal<PlayerData>({
    teeDropDown1: '',  
    teeDropDown2: '',  
    teeDropDown3: '',  
    teeDropDown4: '',  
    putts: false,
    penalties: false
  })

   playerDataForm = form(this.playerDataModel, schemaPath => {
      disabled(schemaPath.teeDropDown2, () => this.noOfPlayersSgn() < 2),
      disabled(schemaPath.teeDropDown3, () => this.noOfPlayersSgn() < 3),
      disabled(schemaPath.teeDropDown4, () => this.noOfPlayersSgn() < 4),

      required(schemaPath.teeDropDown1),
      required(schemaPath.teeDropDown2),
      required(schemaPath.teeDropDown3),
      required(schemaPath.teeDropDown4) 

  });  

  Format = Format;

  displaySgn = signal(false);  
  loadingSgn = signal(false);  
  noOfPlayersSgn: WritableSignal<number>; 
  playersSgn = signal<Player[]>([]); 
   
  searchInProgressSgn = signal<boolean[]>(Array(this.MAX_PLAYERS).fill(false));  
  faSearchPlusSgn = signal<IconDefinition>(faSearchPlus);  
  faCheckCircleSgn = signal<IconDefinition>(faCheckCircle);  

  teeOptions = signal<TeeOptions[][]>(Array.from({ length: this.MAX_PLAYERS }, () => []));  
  teeOptionsMale = signal<TeeOptions[]>([]);  
  teeOptionsFemale = signal<TeeOptions[]>([]);   
  
  tees: Tee[] = [];  
    
  constructor(  
    protected httpService: HttpService,    
    protected alertService: AlertService,  
    private readonly authenticationService: AuthenticationService,  
    protected dialog: MatDialog,
    readonly navigationService: NavigationService,
    private readonly scorecardHttpService: ScorecardHttpService, 
    private readonly router: Router
  ) {  
    super(alertService, dialog, httpService);  
  }  
  
  ngOnInit(): void {  
    this.initializeSignals();        
    this.getCourseData();  

  }  
  
  private initializeSignals(): void {  
    this.loadingSgn.set(false);  
    this.noOfPlayersSgn = linkedSignal(() =>  {
      let noOfPlayers = this.MAX_PLAYERS;
      switch (this.formatSgn()) {
        case Format.STROKE_PLAY:
          noOfPlayers = 1; // stroke play round minimum 1 max 4 players
          break;
        case Format.MATCH_PLAY:
          noOfPlayers = 2; // match play round always 2 players
          break;
        default: 
          noOfPlayers = this.MAX_PLAYERS; // four ball default is always four players (for stroke play can be 3 thus entire 3 players flight will be one team)
      } 
      return noOfPlayers; 
    });
    this.playersSgn.set(Array(this.MAX_PLAYERS));  
    this.tees = Array(this.MAX_PLAYERS);  
    this.searchInProgressSgn.set(Array(this.MAX_PLAYERS).fill(false));    

  }  


  private isAllNicksSet(): boolean {
    return this.playersSgn().slice(0, this.noOfPlayersSgn()).every(p => !!p);
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
    
  private getCourseData(): void { 
  
    // initiate player with logged in player
    this.playersSgn.update(arr => {  
      const copy = [...arr];  
      copy[0] = this.authenticationService.currentPlayerValue;  
      return copy;  
    });
  
    // Load holes and tees  
    forkJoin([  
      this.httpService.getHoles(this.courseSgn().id),  
      this.httpService.getTees(this.courseSgn().id),  
    ]).subscribe(([holes, tees]) => {  
      this.courseSgn().holes = holes;  
      this.courseSgn().tees = tees; 
      
      this.populateTeeOptions(tees);  
  
      const p0 = this.playersSgn()[0];  
      this.teeOptions.update(prev => {  
        const copy = [...prev];  
        copy[0] = p0 ? (p0.sex ? this.teeOptionsFemale() : this.teeOptionsMale()) : [];  
        return copy;  
      });
      
      this.displaySgn.set(true);  
    });  
  }  
  
  private populateTeeOptions(tees: Tee[]): void {  
    const teeTypeLabels = ['1-18', '1-9', '10-18'];  
  
    const male = tees.filter(t => !t.sex).map(t => ({ label: `${t.tee} ${teeTypeLabels[t.teeType] ?? ''}`, value: t.id }));  
    const female = tees.filter(t => t.sex).map(t => ({ label: `${t.tee} ${teeTypeLabels[t.teeType] ?? ''}`, value: t.id }));  
  
    this.teeOptionsMale.set(male);  
    this.teeOptionsFemale.set(female);  
  }  

   
  onPlayers(players: number): void {

    this.noOfPlayersSgn.set(players);

  }
    
  protected processPlayer(player: Player, playerIdx: number): Promise<Player | undefined> {  
    if (player && !this.isNickDuplicated(player.nick)) {
      
       this.playersSgn.update(arr => {  
        const copy = [...arr];  
        copy[playerIdx] = player;  
        return copy;  
      });
      
      this.teeOptions.update(prev => {  
        const copy = [...prev];  
        copy[playerIdx] = player ? (player.sex ? this.teeOptionsFemale() : this.teeOptionsMale()) : [];  
        return copy;  
      });

    }  
    return Promise.resolve(undefined);  
  }  
  
  private isNickDuplicated(nick: string): boolean {  
    const duplicate = this.playersSgn().some(p => p && p.nick === nick);  
    if (duplicate) {  
      this.alertService.error(  
        $localize`:@@onlnRndDef-PlrNotUnique:Player must be unique in the single score card`,  
        false  
      );  
    }  
    return duplicate;  
  }  
  
  getTeeOptions(idx: number): TeeOptions[] {  
    return this.teeOptions()[idx] ?? []; 
  }  
   
  updateWHS(playerIdx: number): void {  
    const dialogRef = this.dialog.open(UpdateWhsDialogComponent, {  
      disableClose: true,  
      autoFocus: true,  
      data: { player: this.playersSgn()[playerIdx] }  
    });  
    
    dialogRef.afterClosed().pipe(  
      switchMap((result: any) => {  
        const player = this.playersSgn()[playerIdx];  
        const parsed = parseFloat(String(result.whs).replace(',', '.'));  
        
        player.whs = parsed;  
        this.setSearchInProgress(playerIdx, true);  
    
        const update$ = playerIdx === 0  
          ? this.httpService.updatePlayer(player)  
          : this.httpService.updatePlayerOnBehalf(player);  
    
        return from(update$).pipe(  
          finalize(() => this.setSearchInProgress(playerIdx, false)) 
            
        );  
      })  
    ).subscribe(() => {  
      this.playersSgn.update(arr => {  
        const copy = [...arr];  
        copy[playerIdx] = { ...this.playersSgn()[playerIdx] };  
        return copy;  
      });  
    });  
  } 

  private setSearchInProgress(index: number, value: boolean): void {  
    this.searchInProgressSgn()[index] = value;  
    this.searchInProgressSgn.set([...this.searchInProgressSgn()]);  
  }  
  
  protected processPostPlayer(_: unknown): void {  
    // Intentionally left blank  
  }  

  onStartOnlineRound(event: Event) {

    this.playerDataForm.teeDropDown1().markAsTouched();
    this.playerDataForm.teeDropDown2().markAsTouched();
    this.playerDataForm.teeDropDown3().markAsTouched();
    this.playerDataForm.teeDropDown4().markAsTouched();

    event.preventDefault();

    // stop here if players where not verified in database
    if (!this.isAllNicksSet()) {
      this.alertService.error(
        $localize`:@@onlnRndDef-lookForPlrs:Please use loupe for remaning players to verify them. Each player needs to be greayed out before proceeding.`, false
      );
      return;
    }

    submit(this.playerDataForm, async () => {      

      const onlineRounds: OnlineRound[] = Array(this.noOfPlayersSgn());

      let counter = 0;
      while (counter < this.noOfPlayersSgn()) {

        const controlName = `teeDropDown${counter + 1}`;  
        const selectedTeeId = this.playerDataForm[controlName]().value(); 
        
        this.tees[counter] = this.courseSgn().tees.find(t => t.id === selectedTeeId)!; 

        const onlineRound: OnlineRound = {
          course: this.courseSgn(),
          teeTime: getDateAndTime()[1],
          player: this.playersSgn()[counter],
          tee: this.tees[counter] = this.courseSgn().tees.find(t => t.id === selectedTeeId)!, 
          owner: this.playersSgn()[0].id,
          finalized: false,
          putts: this.playerDataForm.putts().value(),
          penalties: this.playerDataForm.penalties().value(),
          matchPlay: this.formatSgn() === Format.MATCH_PLAY,
          // required not to filter on frontend on view page
          nick2: this.formatSgn() === Format.MATCH_PLAY ? this.playersSgn()[1].nick : '',
          mpFormat: this.formatSgn()
        };

        onlineRounds[counter] = onlineRound;
        counter++;
      }

      // verify if there is the same tee type for both players in case of MP
      if (this.formatSgn() === Format.MATCH_PLAY && !this.isMpTeeTypeCorrect()) {
        return;
      }

      this.loadingSgn.set(true);

      this.scorecardHttpService
        .addOnlineRounds(onlineRounds)
        .pipe(
          finalize(() => this.loadingSgn.set(false))       
        )
      .subscribe(or => {
        this.navigationService.setCourseSgn(signal(this.courseSgn()));
        this.navigationService.setOnlineRoundsSgn(signal(or));
        if (this.formatSgn() === Format.MATCH_PLAY ) {
          this.router.navigate(['/scorecard/onlineMatchplay']).catch(error => console.log(error));
        } else {
          this.router.navigate(['/scorecard/onlineRound']).catch(error => console.log(error));
        }
      })
    });
  }   
}  


 