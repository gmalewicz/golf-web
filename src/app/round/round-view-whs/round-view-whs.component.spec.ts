import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoundViewWHSComponent } from './round-view-whs.component';

describe('RoundViewWHSComponent', () => {
  let component: RoundViewWHSComponent;
  let fixture: ComponentFixture<RoundViewWHSComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundViewWHSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundViewWHSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
