import { routing } from '@/app.routing';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { teeTypes } from '@/_models/tee';
import { AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule} from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';

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
        FontAwesomeModule,
        routing,
      ],
      providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        TournamentHttpService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentRoundsComponent);
    history.pushState({test: {}}, '');
    component = fixture.componentInstance;
    component.faPlusCircle = faPlusCircle;
    component.tournament = {id: 1, name: 'test', startDate: '2020/10/10', endDate: '2020/10/10'};
    component.rounds = [{course: {name: 'Lisia Polana', par: 72}, roundDate: '10/10/2020',
    matchPlay: false, player: [{nick: 'test', roundDetails: {whs: 10, cr: 68, sr: 133, teeId: 0, teeType: teeTypes.TEE_TYPE_18}}],
    scoreCard: [{hole: 1, stroke: 1, pats: 0}]}];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
