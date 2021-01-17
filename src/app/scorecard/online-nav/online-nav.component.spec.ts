import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineNavComponent } from './online-nav.component';

describe('OnlineNavComponent', () => {
  let component: OnlineNavComponent;
  let fixture: ComponentFixture<OnlineNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
