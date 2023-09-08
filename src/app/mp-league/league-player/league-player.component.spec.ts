import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaguePlayerComponent } from './league-player.component';

describe('LeaguePlayerComponent', () => {
  let component: LeaguePlayerComponent;
  let fixture: ComponentFixture<LeaguePlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaguePlayerComponent]
    });
    fixture = TestBed.createComponent(LeaguePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
