import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMatchComponent } from './add-match.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '@/_services/authentication.service';
import { MyRouterStub, alertServiceStub, authenticationServiceStub } from '@/_helpers/test.helper';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { AlertService } from '@/_services/alert.service';
import { HttpService } from '@/_services/http.service';
import { Router } from '@angular/router';

describe('AddMatchComponent', () => {
  let component: AddMatchComponent;
  let fixture: ComponentFixture<AddMatchComponent>;
  let currentPlayerValueSpy: jasmine.Spy<jasmine.Func>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMatchComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        DropdownModule,
      ],
      providers: [HttpService,
                  LeagueHttpService,
                  { provide: AlertService, useValue: alertServiceStub },
                  { provide: Router, useClass: MyRouterStub },
      ]
    });
    fixture = TestBed.createComponent(AddMatchComponent);
    component = fixture.componentInstance;
    currentPlayerValueSpy = spyOnProperty(component.authenticationService , 'currentPlayerValue');
    component.navigationService.league.set({id: 1, name: 'test league', status: true});
  });

  it('should create', () => {
    currentPlayerValueSpy.and.returnValue({nick: 'test', id: 1});
    component.navigationService.players.set([{id: 1, playerId: 1, nick: 'Test 1', league: {id: 1, name: 'test league', status: true, player: {id: 1}}},
                                             {id: 2, playerId: 2, nick: 'Test 2', league: {id: 1, name: 'test league', status: true, player: {id: 1}}}]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create but player does not exists', () => {
    currentPlayerValueSpy.and.returnValue(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
