import { Version } from '@/_models';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { tap } from 'rxjs';


@Component({
    selector: 'app-change-log',
    templateUrl: './change-log.component.html',
    imports: [RouterLink]
})
export class ChangeLogComponent implements OnInit {

  version: Version = null;
  display: boolean;

  constructor( public authenticationService: AuthenticationService,
               private readonly router: Router,
               private readonly httpService: HttpService,) { }

  ngOnInit(): void {

    this.display = false;

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      this.getVersion();
    }
  }

  private getVersion() {
    this.httpService.getVersion().pipe(
      tap (
        (retVersion: Version) => {
          this.version = retVersion;
          this.display = true;
      })
    ).subscribe();
  }

}
