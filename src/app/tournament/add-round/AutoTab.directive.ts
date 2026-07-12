import { DOCUMENT } from '@angular/common';
import { Directive, inject, input } from '@angular/core';

@Directive({
  selector: '[appAutoTab]',
  host: {
    '(input)': 'onInput($any($event.target))'
  }
})
export class AutoTabDirective {

  private readonly document = inject(DOCUMENT);
  appAutoTab = input.required<string>();

  onInput(input: HTMLInputElement) {

    if (input.value.search('^(1[0-5]|[2-9]|x)$') === 0) {
      const field = this.document.getElementById(this.appAutoTab());
      if (field) {
        field.focus();
      }
    }
  }

}
