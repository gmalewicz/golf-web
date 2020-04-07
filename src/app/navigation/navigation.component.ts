import { Component, OnInit} from '@angular/core';
import { Player } from '@/_models';
import { AuthenticationService, AlertService } from '@/_services';
import { Router } from '@angular/router';
import { faCog } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  faCog = faCog;

  currentPlayer: Player;

  constructor(private authenticationService: AuthenticationService, private router: Router, private alertService: AlertService) {
    this.authenticationService.currentPlayer.subscribe(x => this.currentPlayer = x);
  }

  ngOnInit(): void {}

  logout(): void {
    console.log('logging out');
    this.authenticationService.logout();
    this.alertService.success('Your have been logged out', true);
    this.router.navigate(['/']);
  }
}
