import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        ScorecardHttpService,
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineScoreCardViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
