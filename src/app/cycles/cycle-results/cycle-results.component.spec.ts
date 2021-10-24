import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CycleResultsComponent } from './cycle-results.component';

describe('CycleResultsComponent', () => {
  let component: CycleResultsComponent;
  let fixture: ComponentFixture<CycleResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CycleResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CycleResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
