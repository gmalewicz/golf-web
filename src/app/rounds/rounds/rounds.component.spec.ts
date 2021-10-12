import { routing } from '@/app.routing';
import { authenticationServiceStub, getTestRound } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoundsComponent } from './rounds.component';

describe('RoundsComponent', () => {

  let component: RoundsComponent;
  let fixture: ComponentFixture<RoundsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundsComponent ],
      imports: [
        HttpClientModule,
        routing,
      ]
      ,
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundsComponent);
    component = fixture.componentInstance;
    component.rounds = [getTestRound()];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
