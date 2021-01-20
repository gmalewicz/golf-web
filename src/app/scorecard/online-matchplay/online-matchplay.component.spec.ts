import { ScorecardHttpService } from './../_services/scorecardHttp.service';
import { routing } from '@/app.routing';
import { ErrorInterceptor, JwtInterceptor } from '@/_helpers';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineMatchplayComponent } from './online-matchplay.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('OnlineMatchplayComponent', () => {
  let component: OnlineMatchplayComponent;
  let fixture: ComponentFixture<OnlineMatchplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineMatchplayComponent ],
      imports: [
        HttpClientModule,
        routing,
        MatDialogModule,
      ]
      ,
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        ScorecardHttpService,
        {
          provide: MatDialogRef,
          useValue: {}
        }
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineMatchplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
