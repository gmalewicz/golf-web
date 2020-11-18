import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnlineScoreCardComponent } from './online-score-card.component';

describe('OnlineScoreCardComponent', () => {
  let component: OnlineScoreCardComponent;
  let fixture: ComponentFixture<OnlineScoreCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineScoreCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineScoreCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
