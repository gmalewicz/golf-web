import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TournamentRoundsComponent } from './tournament-rounds.component';

describe('TournamentRoundsComponent', () => {
  let component: TournamentRoundsComponent;
  let fixture: ComponentFixture<TournamentRoundsComponent>;

  beforeEach(waitForAsync(() => {
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
