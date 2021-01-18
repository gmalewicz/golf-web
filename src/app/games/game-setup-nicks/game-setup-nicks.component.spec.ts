import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSetupNicksComponent } from './game-setup-nicks.component';

describe('GameSetupNicksComponent', () => {
  let component: GameSetupNicksComponent;
  let fixture: ComponentFixture<GameSetupNicksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSetupNicksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameSetupNicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
