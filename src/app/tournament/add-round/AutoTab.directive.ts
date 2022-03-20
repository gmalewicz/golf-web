import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appAutoTab]'
})
export class AutoTabDirective {

  @Input() appAutoTab: string;

  constructor() {
    // This is intentional
  }

  @HostListener('input', ['$event.target']) onInput(input: { value: string; }) {

    if (input.value.search('^(1[0-5]|[2-9]|x)$') === 0) {
      const field = document.getElementById(this.appAutoTab);
      if (field) {
        field.focus();
      }
    }
  }

}
