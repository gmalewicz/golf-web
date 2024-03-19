import { AuthenticationService, HttpService } from '@/_services';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { TournamentHttpService } from '../_services';
import { TournamentsComponent } from './tournaments.component';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { NgModule } from '@angular/core';
import { PreloadAllModules, Router, provideRouter, withPreloading } from '@angular/router';
import { routing } from '@/app.routing';

@NgModule()
export class FixNavigationTriggeredOutsideAngularZoneNgModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_router: Router) {
  }
}

describe('TournamentsComponent', () => {

  const standardSetup = () => {
    fixture = TestBed.createComponent(TournamentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  let component: TournamentsComponent;
  let fixture: ComponentFixture<TournamentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TournamentsComponent,
        FontAwesomeModule,
        FixNavigationTriggeredOutsideAngularZoneNgModule,
      ],
      providers: [HttpService,
        TournamentHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        { provide: AuthenticationService, useValue: authenticationServiceStub },
        provideRouter(routing, withPreloading(PreloadAllModules)),
        provideHttpClient(withInterceptorsFromDi()),
      ]
    })
    .compileComponents();
  }));


  it('should create without player ', () => {
    spyOnProperty(authenticationServiceStub , 'currentPlayerValue', 'get').and.returnValue(null);
    standardSetup();
    expect(component).toBeTruthy();
  });

  it('should show tournament ', () => {
    standardSetup();
    component.showTournament({id: 1, name: 'test', startDate: '10/10/2020', endDate: '10/10/2020', bestRounds: 0, player: {id: 1}});
    expect(component).toBeTruthy();
  });

  it('should verify first table row ', (done) => {
    standardSetup();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRows = fixture.nativeElement.querySelectorAll('tr');
      expect(tableRows.length).toBe(11);
      // Header row
      const headerRow = tableRows[0];
      expect(headerRow.cells[1].innerHTML).toBe('Name');
      expect(headerRow.cells[2].innerHTML).toBe('Start Date');
      expect(headerRow.cells[3].innerHTML).toBe('End Date');
      // Data rows
      const row1 = tableRows[1];
      expect(row1.cells[1].innerHTML).toBe('Elkner Cup');
      expect(row1.cells[2].innerHTML).toBe('Jun 10, 2020');
      expect(row1.cells[3].innerHTML).toBe('Jun 15, 2020');
      // Test more rows here..
      done();
    });
  });

  it('should execute onNext and onPrevious', () => {
    standardSetup();
    component.onNext();
    expect(component.page).toBe(1);
    component.onPrevious();
    expect(component.page).toBe(0);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
