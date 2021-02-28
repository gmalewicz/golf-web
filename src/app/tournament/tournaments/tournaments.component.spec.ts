import { routing } from '@/app.routing';
import { HttpService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { TournamentHttpService } from '../_services';
import { TournamentsComponent } from './tournaments.component';

describe('TournamentsComponent', () => {

  let component: TournamentsComponent;
  let fixture: ComponentFixture<TournamentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentsComponent ],
      imports: [
        HttpClientModule,
        routing,
        FontAwesomeModule
      ],
      providers: [HttpService,
        TournamentHttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentsComponent);
    component = fixture.componentInstance;
    spyOnProperty(component.authenticationService , 'currentPlayerValue').and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
  });

  it('should verify first table row ', (done) => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const tableRows = fixture.nativeElement.querySelectorAll('tr');
      expect(tableRows.length).toBe(7);
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

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
