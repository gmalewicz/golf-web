import { AuthenticationService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bbb-game-rules',
  templateUrl: './bbb-game-rules.component.html'
})
export class BbbGameRulesComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService, private router: Router) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    }
  }
}
