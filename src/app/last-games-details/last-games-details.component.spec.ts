import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastGamesDetailsComponent } from './last-games-details.component';

describe('LastGamesDetailsComponent', () => {
  let component: LastGamesDetailsComponent;
  let fixture: ComponentFixture<LastGamesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastGamesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastGamesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
