import { ListRoundsComponent } from './../list-rounds/list-rounds.component';
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, getTestRound } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoundsComponent } from './rounds.component';
import { RoundsNavigationService } from '../roundsNavigation.service';

describe('RoundsComponent', () => {

  let component: RoundsComponent;
  let fixture: ComponentFixture<RoundsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundsComponent, ListRoundsComponent ],
      imports: [
        HttpClientModule,
        routing,
      ]
      ,
      providers: [HttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  RoundsNavigationService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should execute onNext', () => {
    component.roundsNavigationService.setRounds([getTestRound(), getTestRound(), getTestRound(), getTestRound(), getTestRound()]);
    // component.pageSize = 1;
    component.onNext();
    expect(component.roundsNavigationService.getPage()).toBe(1);
  });

  it('should execute onPrevious', () => {
    component.roundsNavigationService.setPage(1);
    component.roundsNavigationService.setRounds([getTestRound(), getTestRound(), getTestRound(), getTestRound(), getTestRound()]);
    component.onPrevious();
    expect(component.roundsNavigationService.getPage()).toBe(0);
  });

  it('should execute onTabClick 0', () => {
    component.roundsNavigationService.setRounds([getTestRound()]);
    component.onTabClick(0);
    expect(component.roundsNavigationService.getSelectedTab()).toBe(0);
  });

  it('should execute onTabClick 1', () => {
    component.onTabClick(1);
    expect(component.roundsNavigationService.getSelectedTab()).toBe(1);
  });


  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
