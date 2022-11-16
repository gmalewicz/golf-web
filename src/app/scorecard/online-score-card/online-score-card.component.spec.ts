import { NavigationService } from './../_services/navigation.service';
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ScorecardHttpService } from '../_services';
import { OnlineScoreCardComponent } from './online-score-card.component';
import { MimicBackendScoreInterceptor } from '../_helpers/MimicBackendScoreInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('OnlineScoreCardComponent', () => {
  let component: OnlineScoreCardComponent;
  let fixture: ComponentFixture<OnlineScoreCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineScoreCardComponent ],
      imports: [
        HttpClientModule,
        FontAwesomeModule,
        routing,
      ]
      ,
      providers: [HttpService,
        ScorecardHttpService,
        NavigationService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendScoreInterceptor, multi: true },
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
