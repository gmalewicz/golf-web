import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoundComponent } from './round.component';

describe('RoundComponent', () => {
  let component: RoundComponent;
  let fixture: ComponentFixture<RoundComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
