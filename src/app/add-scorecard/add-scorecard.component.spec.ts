import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddScorecardComponent } from './add-scorecard.component';

describe('AddScorecardComponent', () => {
  let component: AddScorecardComponent;
  let fixture: ComponentFixture<AddScorecardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddScorecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
