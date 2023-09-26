import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveMatchComponent } from './remove-match.component';

describe('AddMatchComponent', () => {
  let component: RemoveMatchComponent;
  let fixture: ComponentFixture<RemoveMatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RemoveMatchComponent]
    });
    fixture = TestBed.createComponent(RemoveMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
