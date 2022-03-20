/* tslint:disable:no-unused-variable */

import { AutoTabDirective } from './AutoTab.directive';

describe('Directive: AutoTab', () => {
  it('should create an instance', () => {
    const directive = new AutoTabDirective();
    expect(directive).toBeTruthy();
  });

  it('should verify input with incorrect string', () => {
    const directive = new AutoTabDirective();
    directive.onInput( {value: 't'});

    expect(directive).toBeTruthy();
  });

  it('should verify input with correct string', () => {
    const directive = new AutoTabDirective();
    directive.onInput( {value: 'x'});

    expect(directive).toBeTruthy();
  });

});
