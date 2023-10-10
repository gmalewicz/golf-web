import { ComponentFixture, TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';
import { MpLeaguesComponent } from './mp-leagues.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { routing } from '@/app.routing';
import { HttpService } from '@/_services/http.service';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';
import { MyRouterStub } from '@/_helpers/test.helper';
import { Router } from '@angular/router';

describe('MpLeaguesComponent', () => {
  let component: MpLeaguesComponent;
  let fixture: ComponentFixture<MpLeaguesComponent>;
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MpLeaguesComponent ],
      imports: [
        HttpClientModule,
        routing,
        FontAwesomeModule
      ],
      providers: [HttpService,
                  LeagueHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
        { provide: Router, useClass: MyRouterStub },
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MpLeaguesComponent);
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

  it('should test go to league', fakeAsync(() => {

    component.goToLeague({id: 1, name: 'test league', status: true, player: {id: 1}});
    expect(component).toBeTruthy();

  }));
});
