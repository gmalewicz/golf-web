import { routing } from '@/app.routing';
import { authenticationServiceStub, getTestRound } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { RoundComponent } from './round.component';

describe('RoundComponent', () => {
  let component: RoundComponent;
  let fixture: ComponentFixture<RoundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundComponent ],
      imports: [
        HttpClientModule,
        routing,
        MatDialogModule,
      ]
      ,
      providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        {
          provide: MatDialogRef,
          useValue: {}
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundComponent);
    component = fixture.componentInstance;
    history.pushState({data: {round: getTestRound()}}, '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
