import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRoundComponent } from './add-round.component';

describe('AddRoundComponent', () => {
  let component: AddRoundComponent;
  let fixture: ComponentFixture<AddRoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddRoundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
