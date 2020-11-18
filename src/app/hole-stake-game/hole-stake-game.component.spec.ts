import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HoleStakeGameComponent } from './hole-stake-game.component';

describe('HoleStakeGameComponent', () => {
  let component: HoleStakeGameComponent;
  let fixture: ComponentFixture<HoleStakeGameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HoleStakeGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoleStakeGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
