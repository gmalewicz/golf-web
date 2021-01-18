import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSetupPlayersComponent } from './game-setup-players.component';

describe('GameSetupPlayersComponent', () => {
  let component: GameSetupPlayersComponent;
  let fixture: ComponentFixture<GameSetupPlayersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSetupPlayersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameSetupPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
