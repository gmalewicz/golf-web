import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';  
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';  
import { of } from 'rxjs';  
import { PlayerSelectorComponent } from './player-selector.component';  
import { HttpService, AlertService, AuthenticationService } from '@/_services';  
import { MatDialog, MatDialogRef } from '@angular/material/dialog';  
import { ScorecardHttpService } from '@/scorecard/_services/scorecardHttp.service';  
import { NavigationService } from '@/scorecard/_services/navigation.service';  
import { ActivatedRoute, Router } from '@angular/router';   
import { HttpResponse } from '@angular/common/http';
import { alertServiceStub, authenticationServiceStub, MyRouterStub } from '@/_helpers/test.helper';
import { Format } from '@/_models/format';
  
describe('PlayerSelectorComponent', () => {  

    const routeStub = {
    snapshot: {
      queryParams: {
      }
    }
  };

  let fixture: ComponentFixture<PlayerSelectorComponent>;  
  let component: PlayerSelectorComponent;  
  
  let httpServiceSpy: jasmine.SpyObj<HttpService>;  
  let dialogSpy: jasmine.SpyObj<MatDialog>;  
  let scorecardHttpSpy: jasmine.SpyObj<ScorecardHttpService>;  
  let navigationSpy: jasmine.SpyObj<NavigationService>;  
  let routerSpy: jasmine.SpyObj<Router>;  
  
  const mockHoles = [{ id: 1, number: 1, par: 4 }];  
  const mockTees = [  
    { id: 1, sex: false, tee: 'Blue', teeType: 0 },  
    { id: 2, sex: true, tee: 'Red', teeType: 0 }  
  ];  
  const mockCourse = { id: 123, holes: [], tees: [] }; 
  
  const dialogRefStub = { afterClosed: () => of({ whs: '11' }) } as unknown as MatDialogRef<unknown>;
  
  beforeEach(async () => {  
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['getHoles', 'getTees', 'updatePlayer', 'updatePlayerOnBehalf']);  
    httpServiceSpy.getHoles.and.returnValue(of(mockHoles));  
    httpServiceSpy.getTees.and.returnValue(of(mockTees));  
    // return completing observables so finalize() runs
    httpServiceSpy.updatePlayer.and.returnValue(of(void 0));
    httpServiceSpy.updatePlayerOnBehalf.and.returnValue(of(new HttpResponse<null>));
  
  
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);  
    
    
    // default: open returns dialogRef with afterClosed() -> observable payload  
    dialogSpy.open.and.returnValue(dialogRefStub);  
  
    scorecardHttpSpy = jasmine.createSpyObj('ScorecardHttpService', ['addOnlineRounds']);  
    scorecardHttpSpy.addOnlineRounds.and.returnValue(of([{ id: 1, putts: false, penalties: false, format: 1 }]));  
  
    navigationSpy = jasmine.createSpyObj('NavigationService', ['setCourseSgn', 'setOnlineRoundsSgn']);  
  
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);  
    routerSpy.navigate.and.returnValue(Promise.resolve(true));  
  
    await TestBed.configureTestingModule({
      imports: [PlayerSelectorComponent],
      providers: [
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        { provide: Router, useClass: MyRouterStub },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: MatDialog, useValue: dialogSpy },
        // keep ScorecardHttpService/Nav here if you want, but must override component-level ones below
        { provide: ScorecardHttpService, useValue: scorecardHttpSpy },
        { provide: NavigationService, useValue: navigationSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    // Override component-level providers so the component uses the spies (prevents real XHR)
    TestBed.overrideComponent(PlayerSelectorComponent, {
      set: {
        providers: [
          { provide: ScorecardHttpService, useValue: scorecardHttpSpy },
          { provide: NavigationService, useValue: navigationSpy }
        ]
      }
    });

    await TestBed.compileComponents();
    fixture = TestBed.createComponent(PlayerSelectorComponent);  
    component = fixture.componentInstance;  
  
    // override input signals before ngOnInit runs (detectChanges())  
    // the component defines courseSgn and formatSgn from input.required<...>()  
    // replace them with real signals for tests:  
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).courseSgn = signal(mockCourse);  
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).formatSgn = signal(Format.FOUR_BALL_STROKE_PLAY);  
  
    // run ngOnInit + template init  
    //fixture.detectChanges();  
  });  
  
  
  it('should create', () => {  
    fixture.detectChanges();  
    expect(component).toBeTruthy();  
  });  
  
  it('ngOnInit should load course data and populate tee options & displaySgn', () => {  
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).formatSgn = signal(Format.MATCH_PLAY); 
    fixture.detectChanges();

    // After detectChanges() (ngOnInit), getCourseData forkJoin should have run synchronously  
    expect(httpServiceSpy.getHoles).toHaveBeenCalledWith(mockCourse.id);  
    expect(httpServiceSpy.getTees).toHaveBeenCalledWith(mockCourse.id);  
  
    // displaySgn should be true after successful course/tees load  
    expect(component.displaySgn()).toBeTrue();  
  
    // teeOptionsMale / teeOptionsFemale should be populated from mockTees  
    const male = component.teeOptionsMale();  
    const female = component.teeOptionsFemale();  
    expect(male.length).toBeGreaterThanOrEqual(1);  
    expect(female.length).toBeGreaterThanOrEqual(1);   
  });  
 
  it('updateWHS should open dialog and call httpService.updatePlayer for player 0; toggle searchInProgress', fakeAsync(() => {
  const p0 = { id: 10, nick: 'p0', sex: false, whs: 5 };
  component.playersSgn.set([p0]);

  httpServiceSpy.updatePlayer.calls.reset();
  dialogSpy.open.and.returnValue(dialogRefStub);

  // return a completing observable so finalize() runs
  httpServiceSpy.updatePlayer.and.returnValue(of(void 0));

  // spy the internal toggler if you want explicit call checks
  const spySet = spyOn(component as unknown as { setSearchInProgress: (idx: number, val: boolean) => void }, 'setSearchInProgress').and.callThrough();

  component.updateWHS(0);

  // setSearchInProgress should be called with true first
  expect(spySet).toHaveBeenCalledWith(0, true);

  // advance macrotasks (observables from `of` complete synchronously, tick() is safe)
  tick();

  // finalize should have reverted it to false and updatePlayer called
  expect(httpServiceSpy.updatePlayer).toHaveBeenCalled();
  expect(spySet).toHaveBeenCalledWith(0, false);

}));
 
  it('onStartOnlineRound should show error if not all players are set', () => {  
    // Set noOfPlayersSgn to 2 (override linkedSignal) and only set first player  
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).noOfPlayersSgn = signal(2);  
    component.playersSgn.set([ { id: 1, nick: 'a' }, null, null, null ]);  
  
    const evt = new Event('submit');  
    spyOn(evt, 'preventDefault').and.callThrough();  
  
    component.onStartOnlineRound(evt);  
  
    expect(evt.preventDefault).toHaveBeenCalled();  
    expect(scorecardHttpSpy.addOnlineRounds).not.toHaveBeenCalled();  
  });  


  it('onStartOnlineRound should process correctly if all players set for stroke play round ', () => {  
    // Set noOfPlayersSgn to 2 (override linkedSignal) and only set first player  
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).noOfPlayersSgn = signal(1);  
    component.playersSgn.set([ { id: 1, nick: 'a' } ]); 
  
    component.playerDataForm.teeDropDowns[0]().controlValue.set({tee: '1'}); // set a tee for player 0
  
    const evt = new Event('submit');  
    spyOn(evt, 'preventDefault').and.callThrough();  
  
    component.onStartOnlineRound(evt);  
  
    expect(evt.preventDefault).toHaveBeenCalled();  
    expect(scorecardHttpSpy.addOnlineRounds).toHaveBeenCalled();  
  }); 
  
 
  it('onStartOnlineRound should process correctly if all players set for match play round ', () => {  

    // Set noOfPlayersSgn to 2 (override linkedSignal) and only set first player
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).noOfPlayersSgn = signal(2);
   
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).formatSgn = signal(Format.MATCH_PLAY);
     
  
    component.playerDataModel.update(current =>  { return {...current, teeDropDowns: current.teeDropDowns.concat({ tee: '1' })}; });


    component.playerDataForm.teeDropDowns[0]().controlValue.set({tee: '1'}); // set a tee for player 0
    component.playerDataForm.teeDropDowns[1]().controlValue.set({tee: '1'}); // set a tee for player 1

    fixture.detectChanges();

     (component as unknown as Record<string, (...args: unknown[]) => unknown>).playersSgn = signal([ { id: 1, nick: 'a' }, { id: 2, nick: 'b' } ]);

    const evt = new Event('submit');
    spyOn(evt, 'preventDefault').and.callThrough();

    component.tees = [{ id: 11, sex: false, tee: 'Blue', teeType: 0 }];
    component.tees.push({ id: 12, sex: false, tee: 'Blue', teeType: 0 });
    
    component.onStartOnlineRound(evt);  
  
    expect(evt.preventDefault).toHaveBeenCalled();  
    expect(scorecardHttpSpy.addOnlineRounds).toHaveBeenCalled();  
  });

  it('onPlayers should set number of players and initialize playersSgn', () => {
    // make sure the internal noOfPlayersSgn exists and has a sensible default
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).noOfPlayersSgn = signal(4);

    // run ngOnInit / effects
    fixture.detectChanges();

    // call the method under test
    component.onPlayers(2);

    // verify the internal signal and players array
    expect((component as unknown as Record<string, (...args: unknown[]) => unknown>).noOfPlayersSgn()).toBe(2);

    const players = component.playersSgn();
    expect(players.length).toBeGreaterThanOrEqual(2);

    // first player should be the logged-in user from the injected auth stub
    expect(players[0]).toBeTruthy();
    expect(players[0].id).toBe((authenticationServiceStub as unknown as { currentPlayerValue: { id: number } }).currentPlayerValue.id);
  });

  it('processPlayer (protected) should place provided player into playersSgn at given index', () => {
    // ensure component initialized
    fixture.detectChanges();

    // start with empty slots
    component.playersSgn.set([null, null, null, null]);

    const newPlayer = { id: 42, nick: 'procPlayer', sex: false, whs: 9 };

    // call protected method via any cast
    (component as unknown as Record<string, (...args: unknown[]) => unknown>).processPlayer(newPlayer, 1);

    const players = component.playersSgn();
    expect(players[1]).toBeTruthy();
    expect(players[1].id).toBe(42);
    expect(players[1].nick).toBe('procPlayer');
  });
  
});
