import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import { Player } from '@/_models';
import { AuthenticationService, AlertService } from '@/_services';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    imports: [ReactiveFormsModule, FormsModule, RouterLink]
})
export class NavigationComponent implements OnInit {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  activeLocale = inject(LOCALE_ID);


  display: boolean;
  currentPlayer: Player;

  locales = [
    { code: 'en-US', name: 'English' },
    { code: 'pl', name: 'Polski' },
  ];

  ngOnInit(): void {
    this.display = false;
    this.authenticationService.currentPlayer.subscribe(x => this.currentPlayer = x);
  }

  logout(): void {
    this.authenticationService.logout();
    this.alertService.success($localize`:@@nav-logoutSuccess:Your have been logged out`, true);
    this.router.navigate(['']).catch(error => console.log(error));
    this.display = false;
  }

  onClick() {
    this.display = !this.display;
  }

  onChange() {
    globalThis.location.href = `/${this.activeLocale}`;
  }
}
