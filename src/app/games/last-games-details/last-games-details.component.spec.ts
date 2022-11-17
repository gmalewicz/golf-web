import { routing } from '@/app.routing';
import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { GameHttpService } from '../_services/gameHttp.service';

import { LastGamesDetailsComponent } from './last-games-details.component';

describe('LastGamesDetailsComponent', () => {

  let component: LastGamesDetailsComponent;
  let fixture: ComponentFixture<LastGamesDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LastGamesDetailsComponent ],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        routing,
      ],
      providers: [GameHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        HttpService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test'}]));
    fixture = TestBed.createComponent(LastGamesDetailsComponent);
    history.pushState({data: {game: {gameId: 1, stake: 3, gameDate: '10/10/2020',
      gameData: {playerNicks: ['first', 'second'], score: [1 , 1], gameResult: [[1, 1]] }}}}, '');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
