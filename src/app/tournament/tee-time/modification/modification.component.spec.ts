import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ModificationComponent } from './modification.component';
import { TournamentNavigationService } from '@/tournament/_services/tournamentNavigation.service';
import { TeeTimePublishStatus } from '@/tournament/_models';

describe('ModificationComponent', () => {
  let component: ModificationComponent;
  let fixture: ComponentFixture<ModificationComponent>;
  const tournamentNavigationService: TournamentNavigationService = new TournamentNavigationService();

  beforeEach(async () => {
    tournamentNavigationService.init();
    await TestBed.configureTestingModule({
      imports: [ModificationComponent],
      providers: [
        { provide: TournamentNavigationService, useValue: tournamentNavigationService},
      ]
    })
    .compileComponents();
    tournamentNavigationService.tournamentPlayers.set([]);
    fixture = TestBed.createComponent(ModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should modifyPlayer when first to swap is undefined', () => {
    component.modBackCls.push('');
    component.modifyPlayer(0);
    expect(component.modBackCls[0]).toBe('golf-background-red');
  });

  it('should modifyPlayer when first to swap is defined', fakeAsync(() => {
    tournamentNavigationService.teeTimeParameters.set({firstTeeTime: "09:00", teeTimeStep: 10, flightSize: 4, published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED});
    component.modBackCls.push('');
    component.modBackCls.push('');

    component.modifyPlayer(0);
    component.modifyPlayer(1);

    tick(2000);

    expect(component.modBackCls[0]).toBe('');
  }));

  it('should modifyFlight but player is not selected', fakeAsync(() => {
    component.modifyFlight(0);
    tick(2000);
    expect(component.modBackCls[0]).toBe(undefined);
  }));

  it('should modifyFlight but player selected the same flight', fakeAsync(() => {
    component.modBackCls.push('');
    component.modifyPlayer(0);
    tournamentNavigationService.loadTeeTimesFlag = true;
    tournamentNavigationService.teeTimeParameters.set({firstTeeTime: "09:00",
                                                       teeTimeStep: 10,
                                                       flightSize: 4,
                                                       published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                                       teeTimes: [{hcp: 10, nick: 'test', flight: 1, time: '10:00'}]});


    component.modifyFlight(0);
    tick(2000);
    expect(component.modBackCls[0]).toBe('');
  }));

  it('should modifyFlight but original flight will have less than 2 players', fakeAsync(() => {
    component.modBackCls.push('');
    component.modifyPlayer(0);
    tournamentNavigationService.loadTeeTimesFlag = true;
    tournamentNavigationService.teeTimeParameters.set({firstTeeTime: "09:00",
                                                       teeTimeStep: 10,
                                                       flightSize: 4,
                                                       published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                                       teeTimes: [{hcp: 10, nick: 'test', flight: 1, time: '10:00'},
                                                                  {hcp: 11, nick: 'test2', flight: 2, time: '10:10'}]});


    component.modifyFlight(1);
    tick(2000);
    expect(component.modBackCls[0]).toBe('');
  }));

  it('should modifyFlight but target flight will have 4 players', fakeAsync(() => {
    component.modBackCls.push('');
    component.modifyPlayer(0);
    tournamentNavigationService.loadTeeTimesFlag = true;
    tournamentNavigationService.teeTimeParameters.set({firstTeeTime: "09:00",
                                                       teeTimeStep: 10,
                                                       flightSize: 4,
                                                       published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                                       teeTimes: [{hcp: 10, nick: 'test', flight: 1, time: '10:00'},
                                                                  {hcp: 11, nick: 'test2', flight: 1, time: '10:00'},
                                                                  {hcp: 12, nick: 'test3', flight: 1, time: '10:00'},
                                                                  {hcp: 13, nick: 'test4', flight: 2, time: '10:10'},
                                                                  {hcp: 14, nick: 'test5', flight: 2, time: '10:10'},
                                                                  {hcp: 15, nick: 'test6', flight: 2, time: '10:10'},
                                                                  {hcp: 16, nick: 'test7', flight: 2, time: '10:10'}]});


    component.modifyFlight(3);
    tick(2000);
    expect(component.modBackCls[0]).toBe('');
  }));

  it('should modifyFlight with success', fakeAsync(() => {
    component.modBackCls.push('');
    component.modifyPlayer(0);
    tournamentNavigationService.loadTeeTimesFlag = true;
    tournamentNavigationService.teeTimeParameters.set({firstTeeTime: "09:00",
                                                       teeTimeStep: 10,
                                                       flightSize: 4,
                                                       published: TeeTimePublishStatus.STATUS_NOT_PUBLISHED,
                                                       teeTimes: [{hcp: 10, nick: 'test', flight: 1, time: '10:00'},
                                                                  {hcp: 11, nick: 'test2', flight: 1, time: '10:00'},
                                                                  {hcp: 12, nick: 'test3', flight: 1, time: '10:00'},
                                                                  {hcp: 13, nick: 'test4', flight: 2, time: '10:10'},
                                                                  {hcp: 14, nick: 'test5', flight: 2, time: '10:10'},
                                                                  {hcp: 15, nick: 'test6', flight: 2, time: '10:10'}]});


    component.modifyFlight(3);
    tick(3000);
    expect(tournamentNavigationService.teeTimes().filter(tt => tt.flight === 2).length).toBe(4);
  }));

});
