import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AddLeagueComponent } from './add-league.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { routing } from '@/app.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '@/_services/http.service';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { By } from '@angular/platform-browser';

describe('AddLeagueComponent', () => {
  let component: AddLeagueComponent;
  let fixture: ComponentFixture<AddLeagueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddLeagueComponent],
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
      ],
      providers: [HttpService,

        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
        LeagueHttpService
      ]
    })
      .compileComponents();
  }));
/*
  it('should create without player ', () => {

    localStorage.removeItem('currentPlayer');

    fixture = TestBed.createComponent(AddLeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
*/
  it('should test addLeague', () => {

    localStorage.setItem('currentPlayer', JSON.stringify([{ nick: 'test' }]));
    fixture = TestBed.createComponent(AddLeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    // Trigger click event after spyOn
    component.f.name.setValue('test league');

    buttonElement.nativeElement.click();


    expect(component.isLoading()).toBeFalsy();

  });

  it('should test addLeague with invalid form', () => {

    localStorage.setItem('currentPlayer', JSON.stringify([{ nick: 'test' }]));
    fixture = TestBed.createComponent(AddLeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    // Trigger click event after spyOn
    buttonElement.nativeElement.click();

    //tick();
    expect(component.addLeagueForm.invalid).toBeTruthy();

  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
    TestBed.resetTestingModule();
  });
});
