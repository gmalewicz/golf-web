import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentRoundsComponent } from './tournament-rounds.component';

describe('TournamentRoundsComponent', () => {
  let component: TournamentRoundsComponent;
  let fixture: ComponentFixture<TournamentRoundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentRoundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentRoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
