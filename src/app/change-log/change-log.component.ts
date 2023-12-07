import { Version } from '@/_models';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Component({
  selector: 'app-change-log',
  templateUrl: './change-log.component.html'
})
export class ChangeLogComponent implements OnInit {

  version: Version = null;
  display: boolean;

  constructor( private authenticationService: AuthenticationService,
               private router: Router,
               private httpService: HttpService,) { }

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
