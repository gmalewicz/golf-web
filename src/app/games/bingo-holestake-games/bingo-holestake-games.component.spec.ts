import { routing } from '@/app.routing';
import { ErrorInterceptor } from '@/_helpers/error.interceptor';
import { JwtInterceptor } from '@/_helpers/jwt.interceptor';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { GameHttpService } from '../_services/gameHttp.service';

import { BingoHolestakeGamesComponent } from './bingo-holestake-games.component';

describe('BingoHolestakeGamesComponent', () => {
  let component: BingoHolestakeGamesComponent;
  let fixture: ComponentFixture<BingoHolestakeGamesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BingoHolestakeGamesComponent ],
      imports: [
        HttpClientModule,
        MatDialogModule,
        routing,
      ],
      providers: [GameHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        HttpService,
        {
          provide: MatDialogRef,
          useValue: {}
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {

    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test'}]));
    history.pushState({data: {playersNo: 2, stake: 3, players: ['first', 'second'], gameType: 1}}, '');
    fixture = TestBed.createComponent(BingoHolestakeGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
