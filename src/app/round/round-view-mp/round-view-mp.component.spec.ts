import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundViewMPComponent } from './round-view-mp.component';

describe('RoundViewMPComponent', () => {
  let component: RoundViewMPComponent;
  let fixture: ComponentFixture<RoundViewMPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoundViewMPComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundViewMPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
