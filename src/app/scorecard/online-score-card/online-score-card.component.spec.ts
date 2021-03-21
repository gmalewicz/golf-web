
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScorecardHttpService } from '../_services';

import { OnlineScoreCardComponent } from './online-score-card.component';

describe('OnlineScoreCardComponent', () => {
  let component: OnlineScoreCardComponent;
  let fixture: ComponentFixture<OnlineScoreCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineScoreCardComponent ],
      imports: [
        HttpClientModule,
        routing,
      ]
      ,
      providers: [HttpService,
        ScorecardHttpService,
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
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
