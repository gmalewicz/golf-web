import { routing } from '@/app.routing';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CycleDetailsComponent } from './cycle-details.component';

describe('CycleDetailsComponent', () => {
  let component: CycleDetailsComponent;
  let fixture: ComponentFixture<CycleDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CycleDetailsComponent],
      imports: [
        routing,
        HttpClientModule,
      ],
      providers: [HttpService,
        { provide: AuthenticationService, useValue: authenticationServiceStub },
      ]
    })
      .compileComponents();
  }));

  it('should create fully initialized', () => {
    fixture = TestBed.createComponent(CycleDetailsComponent);
    history.pushState({
      data: {
        cycle: {
          id: 1, name: 'Test tournament 1', status: false, rule: 0,
          player: { id: 1, nick: 'golfer', sex: false, whs: 38.4 }
        }
      }
    }, '');
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create not initialized', () => {
    fixture = TestBed.createComponent(CycleDetailsComponent);
    component = fixture.componentInstance;
    history.pushState({
      data: undefined
    }, '');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
