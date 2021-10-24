import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { routing } from '@/app.routing';
import { CycleHttpService } from '../_services/cycleHttp.service';
import { MimicBackendCycleInterceptor } from '../_helpers/MimicBackendCycleInterceptor';
import { CyclesComponent } from './cycles.component';
import { HttpService } from '@/_services/http.service';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';

describe('CyclesComponent', () => {
  let component: CyclesComponent;
  let fixture: ComponentFixture<CyclesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CyclesComponent ],
      imports: [
        HttpClientModule,
        routing,
        FontAwesomeModule
      ],
      providers: [HttpService,
                  CycleHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendCycleInterceptor, multi: true }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CyclesComponent);
    component = fixture.componentInstance;
    spyOnProperty(component.authenticationService , 'currentPlayerValue').and.returnValue({nick: 'test', id: 1});
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
