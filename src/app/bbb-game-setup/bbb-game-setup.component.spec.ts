import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BbbGameSetupComponent } from './bbb-game-setup.component';

describe('BbbGameSetupComponent', () => {
  let component: BbbGameSetupComponent;
  let fixture: ComponentFixture<BbbGameSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BbbGameSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BbbGameSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
