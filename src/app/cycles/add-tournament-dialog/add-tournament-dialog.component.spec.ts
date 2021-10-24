import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTournamentDialogComponent } from './add-tournament-dialog.component';

describe('AddTournamentDialogComponent', () => {
  let component: AddTournamentDialogComponent;
  let fixture: ComponentFixture<AddTournamentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddTournamentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTournamentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
