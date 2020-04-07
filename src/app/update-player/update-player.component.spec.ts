import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePlayerComponent } from './update-player.component';

describe('UpdatePlayerComponent', () => {
  let component: UpdatePlayerComponent;
  let fixture: ComponentFixture<UpdatePlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
