import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundsComponent } from './rounds.component';

describe('RoundsComponent', () => {
  let component: RoundsComponent;
  let fixture: ComponentFixture<RoundsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
