import { AutoTabDirective } from './AutoTab.directive';
import { routing } from '@/app.routing';
import { MimicBackendAppInterceptor } from '@/_helpers/MimicBackendAppInterceptor';
import { HttpService } from '@/_services/http.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TournamentHttpService } from '../_services/tournamentHttp.service';
import { AddRoundComponent } from './add-round.component';
import { MimicBackendTournamentInterceptor } from '../_helpers/MimicBackendTournamentInterceptor';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AddRoundComponent', () => {
  let component: AddRoundComponent;
  let fixture: ComponentFixture<AddRoundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRoundComponent, AutoTabDirective ],
      imports: [
        HttpClientModule,
        routing,
        ReactiveFormsModule,
        FontAwesomeModule,
        FormsModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      providers: [HttpService,
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendAppInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: MimicBackendTournamentInterceptor, multi: true },
        TournamentHttpService
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRoundComponent);
    history.pushState({data: {tournament: {id: 1, name: 'Name'}, course: {id: 1}}}, '');
  });

  it('should create without data', () => {
    history.pushState({data: undefined}, '');
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create with data', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should tee change', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.f.teeDropDown.setValue(4);
    component.teeChange();
    expect(component.tee).toBe(4);
  });

  it('should get tee options with defined player', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.player = {id: 1, sex: true};
    component.teeOptionsFemale = [{label: 'yellow', value: 1}];
    component.getTeeOptions();
    expect( component.getTeeOptions()).toBe(component.teeOptionsFemale);
  });

  it('should verify incorrect score', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.onKey('d', 0);
    expect( component.score[0]).toBe('');
  });

  it('should calculate totals with x for both nines', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.score[0] = 'x';
    component.score[9] = 'x';
    component.calculateTotals();
    expect( component.grandTotal).toBe(-1);
  });

  it('should attempt to add round without all holes set', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.addRound();
    expect( component.tournamentRounds).toEqual([]);
  });

  it('should attempt to add round without selected player', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.score.fill('1');
    component.addRound();
    expect( component.tournamentRounds).toEqual([]);
  });

  it('should add round without x', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.score.fill('1');
    component.player = {id: 1, sex: true};
    component.tee = 1;
    component.f.nickDropDown.setValue('nick');
    component.f.teeDropDown.setValue('test');
    component.addRound();
    expect( component.tournamentRounds.length).toEqual(1);
  });

  it('should add round with x', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.score.fill('1');
    component.score[0] = 'x';
    component.player = {id: 1, sex: true};
    component.tee = 1;
    component.f.nickDropDown.setValue('nick');
    component.f.teeDropDown.setValue('test');
    component.addRound();
    expect( component.tournamentRounds.length).toEqual(1);
  });

  it('should change nick and player found', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.f.nickDropDown.setValue('Other2');
    component.f.teeDropDown.setValue('test');
    component.nickChange();
    expect( component.f.nickDropDown.disabled).toBeTruthy();
  });

  it('should change nick and player not found', () => {
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.f.nickDropDown.setValue('Other');
    component.f.teeDropDown.setValue('test');
    component.nickChange();
    expect( component.f.nickDropDown.disabled).toBeFalsy();
  });
});
