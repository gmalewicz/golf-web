import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[loading]',
})
export class LoadingDirective {
  private wrapper: HTMLElement | null = null;
  private originalChildren: ChildNode[] = [];

  @Input() loadingSize: 'sm' | 'lg' | '' = 'sm';
  @Input() loadingColor: string = '';

  @Input() set loading(val: boolean) {
    if (val) {
      if (!this.wrapper) {
        // make host a positioning context
        this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
        // hide only Element nodes (skip text/comment nodes)
        this.originalChildren = (Array.from(this.el.nativeElement.childNodes) as ChildNode[])
          .filter((child: ChildNode) => child.nodeType === Node.ELEMENT_NODE);
        this.originalChildren.forEach((child) =>
          this.renderer.setStyle(child, 'visibility', 'hidden')
        );
        // wrapper handles centering — spinner handles rotation separately
        // (combining transform on one element breaks the CSS animation)
        this.wrapper = this.renderer.createElement('span');
        this.renderer.setStyle(this.wrapper, 'position', 'absolute');
        this.renderer.setStyle(this.wrapper, 'top', '50%');
        this.renderer.setStyle(this.wrapper, 'left', '50%');
        this.renderer.setStyle(this.wrapper, 'transform', 'translate(-50%, -50%)');

        const spinner: HTMLElement = this.renderer.createElement('span');
        this.renderer.addClass(spinner, 'spinner-border');
        if (this.loadingColor) {
          this.renderer.addClass(spinner, this.loadingColor);
        }
        if (this.loadingSize === 'sm') {
          this.renderer.addClass(spinner, 'spinner-border-sm');
        } else if (this.loadingSize === 'lg') {
          this.renderer.setStyle(spinner, 'width', '3rem');
          this.renderer.setStyle(spinner, 'height', '3rem');
        }
        this.renderer.appendChild(this.wrapper, spinner);
        this.renderer.appendChild(this.el.nativeElement, this.wrapper);
      }
    } else {
      if (this.wrapper) {
        this.renderer.removeChild(this.el.nativeElement, this.wrapper);
        this.wrapper = null;
      }
      this.renderer.removeStyle(this.el.nativeElement, 'position');
      this.originalChildren.forEach((child) =>
        this.renderer.removeStyle(child, 'visibility')
      );
      this.originalChildren = [];
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}