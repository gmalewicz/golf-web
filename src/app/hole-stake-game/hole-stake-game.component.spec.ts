import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoleStakeGameComponent } from './hole-stake-game.component';

describe('HoleStakeGameComponent', () => {
  let component: HoleStakeGameComponent;
  let fixture: ComponentFixture<HoleStakeGameComponent>;

  beforeEach(async(() => {
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
