import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoleStakeGameItmComponent } from './hole-stake-game-itm.component';

describe('HoleStakeGameItmComponent', () => {
  let component: HoleStakeGameItmComponent;
  let fixture: ComponentFixture<HoleStakeGameItmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoleStakeGameItmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoleStakeGameItmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
