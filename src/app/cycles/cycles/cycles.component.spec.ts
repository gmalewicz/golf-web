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
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

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
    currentPlayerValueSpy = spyOnProperty(component.authenticationService , 'currentPlayerValue');
  });

  it('should create', () => {
    spyOnProperty(component.authenticationService , 'playerRole').and.returnValue('PLAYER');
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create but player does not exists', () => {
    currentPlayerValueSpy.and.returnValue(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
