import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoadingDirective } from './LoadingDirective';

// [loading] is bound LAST so loadingSize/loadingColor are applied before show() executes
@Component({
  selector: 'app-test-loading',
  template: `
    <button [loadingSize]="size" [loadingColor]="color" [loading]="isLoading">
      <span class="child">Click me</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [LoadingDirective],
})
class TestHostComponent {
  @Input() isLoading = false;
  @Input() size: 'sm' | 'lg' | '' = 'sm';
  @Input() color = '';
}

describe('Directive: Loading', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LoadingDirective, TestHostComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create the directive', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const directiveEl = fixture.debugElement.query(By.directive(LoadingDirective));
    expect(directiveEl).not.toBeNull();
  }));

  it('should not render spinner when loading is false', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeNull();
  }));

  it('should render spinner when loading is true', fakeAsync(() => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).not.toBeNull();
  }));

  it('should set position relative on host when loading is true', fakeAsync(() => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.style.position).toBe('relative');
  }));

  it('should hide child elements when loading is true', fakeAsync(() => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const child: HTMLElement = fixture.nativeElement.querySelector('.child');
    expect(child.style.visibility).toBe('hidden');
  }));

  it('should restore child visibility when loading switches back to false', fakeAsync(() => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    tick();

    const child: HTMLElement = fixture.nativeElement.querySelector('.child');
    expect(child.style.visibility).toBe('');
  }));

  it('should remove spinner when loading switches back to false', fakeAsync(() => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    tick();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeNull();
  }));

  it('should remove position style from host when loading switches back to false', fakeAsync(() => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    tick();

    const button: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(button.style.position).toBe('');
  }));

  it('should add spinner-border-sm class when loadingSize is sm', fakeAsync(() => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).toContain('spinner-border-sm');
  }));

  it('should set width and height 3rem when loadingSize is lg', fakeAsync(() => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinner: HTMLElement = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.style.width).toBe('3rem');
    expect(spinner.style.height).toBe('3rem');
  }));

  it('should not add spinner-border-sm class when loadingSize is lg', fakeAsync(() => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).not.toContain('spinner-border-sm');
  }));

  it('should not add size class when loadingSize is empty string', fakeAsync(() => {
    fixture.componentRef.setInput('size', '');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinner: HTMLElement = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).not.toContain('spinner-border-sm');
    expect(spinner.style.width).toBe('');
  }));

  it('should add loadingColor class to spinner when provided', fakeAsync(() => {
    fixture.componentRef.setInput('color', 'text-primary');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).toContain('text-primary');
  }));

  it('should not add color class when loadingColor is empty', fakeAsync(() => {
    fixture.componentRef.setInput('color', '');
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner.classList).toContain('spinner-border');
    expect(spinner.classList).not.toContain('text-primary');
  }));

  it('should not create duplicate spinners when loading is set true twice', fakeAsync(() => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    tick();

    const spinners = fixture.nativeElement.querySelectorAll('.spinner-border');
    expect(spinners).toHaveSize(1);
  }));
});
