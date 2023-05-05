import { RoundsNavigationService } from '@/rounds/roundsNavigation.service';
import { authenticationServiceStub } from '@/_helpers/test.helper';
import { AuthenticationService } from '@/_services/authentication.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRoundsComponent } from './list-rounds.component';

describe('ListRoundsComponent', () => {

  let component: ListRoundsComponent;
  let fixture: ComponentFixture<ListRoundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListRoundsComponent ],
      providers:
        [{ provide: AuthenticationService, useValue: authenticationServiceStub },
        RoundsNavigationService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListRoundsComponent);
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
