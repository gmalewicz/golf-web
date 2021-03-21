import { routing } from '@/app.routing';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService, HttpService } from '@/_services';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScorecardHttpService } from '../_services';

import { OnlineScoreCardViewComponent } from './online-score-card-view.component';

describe('OnlineScoreCardViewComponent', () => {
  let component: OnlineScoreCardViewComponent;
  let fixture: ComponentFixture<OnlineScoreCardViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineScoreCardViewComponent ],
      imports: [
        HttpClientModule,
        routing,
      ]
      ,
      providers: [HttpService,
        ScorecardHttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    history.pushState({}, '');
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
