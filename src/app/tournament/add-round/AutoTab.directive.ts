import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appAutoTab]',
  standalone: true,
  host: {
    '(input)': 'onInput($event.target)'
  }
})
export class AutoTabDirective {

  appAutoTab = input.required<string>();

  onInput(input: { value: string; }) {

    if (input.value.search('^(1[0-5]|[2-9]|x)$') === 0) {
      const field = document.getElementById(this.appAutoTab());
      if (field) {
        field.focus();
      }
    }
  }

}
