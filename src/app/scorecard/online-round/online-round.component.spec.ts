
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ScorecardHttpService } from '../_services/scorecardHttp.service';

import { OnlineRoundComponent } from './online-round.component';

describe('OnlineRoundComponent', () => {
  let component: OnlineRoundComponent;
  let fixture: ComponentFixture<OnlineRoundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineRoundComponent ],
      imports: [
        HttpClientModule,
        routing,
        MatDialogModule,
      ]
      ,
      providers: [HttpService,
        ScorecardHttpService,
        {
          provide: MatDialogRef,
          useValue: {}
        }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    history.pushState({data: {}}, '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
