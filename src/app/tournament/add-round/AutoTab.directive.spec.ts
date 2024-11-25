/* tslint:disable:no-unused-variable */

import { Component } from '@angular/core';
import { AutoTabDirective } from './AutoTab.directive';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Component({
    selector: 'my-test-component',
    template: '<input id="1" type="text" class="test" [appAutoTab]="1"/>',
    imports: [AutoTabDirective]
})
class TestComponent {}

describe('Directive: AutoTab', () => {

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AutoTabDirective, TestComponent]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;

  });

  it('should verify input with incorrect string', () => {

    fixture.detectChanges();
    const directiveEl = fixture.debugElement.query(By.directive(AutoTabDirective));
    expect(directiveEl).not.toBeNull();

    const directiveInstance = directiveEl.injector.get(AutoTabDirective);

    directiveInstance.onInput({value: 't'});

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should verify input with correct string', () => {
    fixture.detectChanges();

    const inputEl = fixture.debugElement.query(By.css('.test'));
    expect(inputEl).not.toBeNull();
    inputEl.nativeElement.value = 'x';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
