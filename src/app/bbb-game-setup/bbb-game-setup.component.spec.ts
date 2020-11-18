import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BbbGameSetupComponent } from './bbb-game-setup.component';

describe('BbbGameSetupComponent', () => {
  let component: BbbGameSetupComponent;
  let fixture: ComponentFixture<BbbGameSetupComponent>;

  beforeEach(waitForAsync(() => {
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
