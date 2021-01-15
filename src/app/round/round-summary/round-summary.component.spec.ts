import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundSummaryComponent } from './round-summary.component';

describe('RoundSummaryComponent', () => {
  let component: RoundSummaryComponent;
  let fixture: ComponentFixture<RoundSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
