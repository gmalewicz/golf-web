import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentPlayersComponent } from './tournament-players.component';

describe('PlayersComponent', () => {
  let component: TournamentPlayersComponent;
  let fixture: ComponentFixture<TournamentPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TournamentPlayersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
