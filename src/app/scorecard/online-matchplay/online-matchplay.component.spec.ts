import { NavigationService } from './../_services/navigation.service';
import { ScorecardHttpService } from './../_services/scorecardHttp.service';
import { routing } from '@/app.routing';
import { HttpService } from '@/_services';
import { HttpClientModule } from '@angular/common/http';
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
        ScorecardHttpService,
        NavigationService,
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

