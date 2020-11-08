import { Component, OnInit} from '@angular/core';
import { Player } from '@/_models';
import { AuthenticationService, AlertService } from '@/_services';
import { Router } from '@angular/router';
import { faCog, IconDefinition } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  faCog: IconDefinition;
  display: boolean;
  currentPlayer: Player;

  constructor(private authenticationService: AuthenticationService, private router: Router, private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.faCog = faCog;
    this.display = false;
    this.authenticationService.currentPlayer.subscribe(x => this.currentPlayer = x);
  }

  logout(): void {
    // console.log('logging out');
    this.authenticationService.logout();
    this.alertService.success('Your have been logged out', true);
    this.router.navigate(['/']);
  }

  onClick() {
    this.display = !this.display;
  }
}
