import { AuthenticationService } from '@/_services/authentication.service';
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[can]',
})
export class CanDirective {
  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthenticationService
  ) {}
  @Input() set can(role: string) {
    this.vcr.clear();
    if (this.auth.playerRole.includes(role)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
