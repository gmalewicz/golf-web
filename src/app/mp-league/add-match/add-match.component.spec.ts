import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMatchComponent } from './add-match.component';
import { LeagueHttpService } from '../_services/leagueHttp.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticationService } from '@/_services/authentication.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

describe('AddMatchComponent', () => {
  let component: AddMatchComponent;
  let fixture: ComponentFixture<AddMatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddMatchComponent],
      imports: [
        HttpClientModule,
        ReactiveFormsModule,
        DropdownModule,
      ],
      providers: [LeagueHttpService,
                  { provide: AuthenticationService, useValue: authenticationServiceStub},
      ]
    });
    fixture = TestBed.createComponent(AddMatchComponent);
    component = fixture.componentInstance;
    component.navigationService.league.set({id: 1, name: 'test league', status: true});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
