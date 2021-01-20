import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { teeTypes } from '@/_models/tee';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TournamentHttpService } from '../_services';

import { TournamentRoundsComponent } from './tournament-rounds.component';

describe('TournamentRoundsComponent', () => {
  let component: TournamentRoundsComponent;
  let fixture: ComponentFixture<TournamentRoundsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentRoundsComponent ],
      imports: [
        HttpClientModule,
        routing,
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        TournamentHttpService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentRoundsComponent);
    component = fixture.componentInstance;
    component.tournament = {id: 1, name: 'test', startDate: '2020/10/10', endDate: '2020/10/10'};
    component.rounds = [{course: {name: 'Lisia Polana', par: 72}, roundDate: '10/10/2020',
    matchPlay: false, player: [{nick: 'test', roundDetails: {whs: 10, cr: 68, sr: 133, teeId: 0, teeType: teeTypes.TEE_TYPE_18}}],
    scoreCard: [{hole: 1, stroke: 1, pats: 0}]}];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
