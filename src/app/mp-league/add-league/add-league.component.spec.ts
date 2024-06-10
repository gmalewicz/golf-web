import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AddLeagueComponent } from './add-league.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routing } from '@/app.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpService } from '@/_services/http.service';
import { MimicBackendMpLeaguesInterceptor } from '../_helpers/MimicBackendMpLeaguesInterceptor';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { By } from '@angular/platform-browser';
import { AlertService } from '@/_services/alert.service';
import { alertServiceStub } from '@/_helpers/test.helper';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

describe('AddLeagueComponent', () => {
  let component: AddLeagueComponent;
  let fixture: ComponentFixture<AddLeagueComponent>;
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [ReactiveFormsModule,
        AddLeagueComponent],
    providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendMpLeaguesInterceptor, multi: true },
        LeagueHttpService,
        { provide: AlertService, useValue: alertServiceStub },
        provideRouter(routing, withPreloading(PreloadAllModules)), provideHttpClient(withInterceptorsFromDi()),]
})
      .compileComponents();
  }));

  beforeEach(() => {
    //localStorage.setItem('currentPlayer', JSON.stringify([{ nick: 'test' }]));
    fixture = TestBed.createComponent(AddLeagueComponent);
    component = fixture.componentInstance;
    currentPlayerValueSpy = spyOnProperty(component.authenticationService , 'currentPlayerValue');
  });

  it('should create but player does not exists', () => {
    currentPlayerValueSpy.and.returnValue(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should test addLeague', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    component.f.name.setValue('test league');
    buttonElement.nativeElement.click();
    expect(component.isLoading()).toBeFalsy();

  });

  it('should test addLeague with invalid form', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    fixture = TestBed.createComponent(AddLeagueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const buttonElement = fixture.debugElement.query(By.css('.btn-success'));
    buttonElement.nativeElement.click();
    expect(component.addLeagueForm.invalid).toBeTruthy();

  });

  afterEach(() => {
    localStorage.removeItem('currentPlayer');
    TestBed.resetTestingModule();
  });
});
