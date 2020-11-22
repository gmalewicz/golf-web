import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnlineRoundComponent } from './online-round.component';

describe('OnlineRoundComponent', () => {
  let component: OnlineRoundComponent;
  let fixture: ComponentFixture<OnlineRoundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineRoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
