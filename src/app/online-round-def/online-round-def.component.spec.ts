import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnlineRoundDefComponent } from './online-round-def.component';

describe('OnlineRoundDefComponent', () => {
  let component: OnlineRoundDefComponent;
  let fixture: ComponentFixture<OnlineRoundDefComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineRoundDefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineRoundDefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
