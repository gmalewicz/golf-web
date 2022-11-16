import { routing } from '@/app.routing';
import { AuthenticationService } from '@/_services/authentication.service';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';


import { CycleResultsComponent } from './cycle-results.component';

describe('CycleResultsComponent', () => {
  let component: CycleResultsComponent;
  let fixture: ComponentFixture<CycleResultsComponent>;
  let authenticationService: AuthenticationService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CycleResultsComponent],
      imports: [
        HttpClientModule,
        routing,
      ],
      providers: [HttpService, AuthenticationService]
    })
      .compileComponents();
  }));


  beforeEach(() => {
    localStorage.setItem('currentPlayer', JSON.stringify([{nick: 'test', id: 1, password: 'test', whs: '10.2'}]));
    fixture = TestBed.createComponent(CycleResultsComponent);
    component = fixture.componentInstance;
    component.cycleResults = [];
    component.cycleTournaments = [{
      id: 20,
      name: 'Sobienie Królewskie',
      rounds: 1,
      bestOf: false
    }];
    fixture.detectChanges();
  });

  it('should create but player does not exists', () => {
    authenticationService = TestBed.inject(AuthenticationService);
    authenticationService.logout();
    fixture = TestBed.createComponent(CycleResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
  });
});
