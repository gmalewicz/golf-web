import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BbbGameComponent } from './bbb-game.component';

describe('BbbGameComponent', () => {
  let component: BbbGameComponent;
  let fixture: ComponentFixture<BbbGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BbbGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BbbGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
