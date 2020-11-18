import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HoleStakeRulesComponent } from './hole-stake-rules.component';

describe('HoleStakeRulesComponent', () => {
  let component: HoleStakeRulesComponent;
  let fixture: ComponentFixture<HoleStakeRulesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HoleStakeRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoleStakeRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
