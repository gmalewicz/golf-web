import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastGamesComponent } from './last-games.component';

describe('LastGamesComponent', () => {
  let component: LastGamesComponent;
  let fixture: ComponentFixture<LastGamesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastGamesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastGamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
