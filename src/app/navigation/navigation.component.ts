import { Component, Inject, LOCALE_ID, OnInit} from '@angular/core';
import { Player } from '@/_models';
import { AuthenticationService, AlertService } from '@/_services';
import { Router } from '@angular/router';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements OnInit {

  faCog: IconDefinition;
  display: boolean;
  currentPlayer: Player;

  locales = [
    { code: 'en-US', name: 'English' },
    { code: 'pl', name: 'Polski' },
  ];

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService,
              @Inject(LOCALE_ID) public activeLocale: string) {
  }

  ngOnInit(): void {
    this.faCog = faCog;
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
    window.location.href = `/${this.activeLocale}`;
  }
}
