import { AuthenticationService } from '@/_services/authentication.service';
import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[can]',
})
export class CanDirective {
  private readonly tpl = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthenticationService);

  @Input() set can(role: string) {
    this.vcr.clear();
    if (this.auth.playerRole.includes(role)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
