import { HttpService } from './../../_services/http.service';
import { routing } from '@/app.routing';
import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GameHttpService } from '../_services/gameHttp.service';

import { LastGamesComponent } from './last-games.component';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { MimicBackendAppInterceptor } from '../_helpers/MimicBackendAppInterceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


describe('LastGamesComponent', () => {

  let component: LastGamesComponent;
  let fixture: ComponentFixture<LastGamesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LastGamesComponent ],
      imports: [
        HttpClientModule,
        FontAwesomeModule,
        routing
      ],
      providers: [GameHttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub },
                  { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
                  HttpService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastGamesComponent);
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
