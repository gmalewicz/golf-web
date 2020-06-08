import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentResultsComponent } from './tournament-results.component';

describe('TournamentResultsComponent', () => {
  let component: TournamentResultsComponent;
  let fixture: ComponentFixture<TournamentResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TournamentResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
