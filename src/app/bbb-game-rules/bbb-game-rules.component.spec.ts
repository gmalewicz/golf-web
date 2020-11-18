import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BbbGameRulesComponent } from './bbb-game-rules.component';

describe('BbbGameRulesComponent', () => {
  let component: BbbGameRulesComponent;
  let fixture: ComponentFixture<BbbGameRulesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BbbGameRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BbbGameRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
