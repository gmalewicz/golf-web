import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRoundsComponent } from './list-rounds.component';

describe('ListRoundsComponent', () => {
  let component: ListRoundsComponent;
  let fixture: ComponentFixture<ListRoundsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListRoundsComponent ]
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
});
