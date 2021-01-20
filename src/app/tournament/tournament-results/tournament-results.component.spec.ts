import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TournamentHttpService } from '../_services';

import { TournamentResultsComponent } from './tournament-results.component';

describe('TournamentResultsComponent', () => {
  let component: TournamentResultsComponent;
  let fixture: ComponentFixture<TournamentResultsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentResultsComponent ],
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
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
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1}]));
    history.pushState({data: {tournament: {id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', player: {id: 1}}}}, '');
    fixture = TestBed.createComponent(TournamentResultsComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
