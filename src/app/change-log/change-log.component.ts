import { Version } from '@/_models';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';
import { LoadingDirective } from '@/_helpers/directives/LoadingDirective';


@Component({
    selector: 'app-change-log',
    templateUrl: './change-log.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, LoadingDirective]
})
export class ChangeLogComponent implements OnInit {
  authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly httpService = inject(HttpService);

  version = signal<Version | null>(null);
  display = signal(false);

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.getVersion();
    }
  }

  private getVersion() {
    this.httpService.getVersion().pipe(
      tap((retVersion: Version) => {
        this.version.set(retVersion);
        this.display.set(true);
      })
    ).subscribe();
  }

}
