import { ListRoundsComponent } from './../list-rounds/list-rounds.component';
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { authenticationServiceStub, getTestRound } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoundsComponent } from './rounds.component';

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
    component.rounds = [getTestRound()];
    component.pageSize = 1;
    component.onNext();
    expect(component.page).toBe(1);
  });

  it('should execute onPrevious', () => {
    component.rounds = [getTestRound()];
    component.page = 1;
    component.onPrevious();
    expect(component.page).toBe(0);
  });

  it('should execute onTabClick 0', () => {
    component.rounds = [getTestRound()];
    component.onTabClick(0);
    expect(component.selectedTab).toBe(0);
  });

  it('should execute onTabClick 1', () => {
    component.onTabClick(1);
    expect(component.selectedTab).toBe(1);
  });


  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
