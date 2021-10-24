import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleTournamentComponent } from './cycle-tournament.component';

describe('CycleTournamentComponent', () => {
  let component: CycleTournamentComponent;
  let fixture: ComponentFixture<CycleTournamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CycleTournamentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CycleTournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
