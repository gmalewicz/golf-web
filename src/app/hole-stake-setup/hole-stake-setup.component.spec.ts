import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoleStakeSetupComponent } from './hole-stake-setup.component';

describe('HoleStakeSetupComponent', () => {
  let component: HoleStakeSetupComponent;
  let fixture: ComponentFixture<HoleStakeSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoleStakeSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoleStakeSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
