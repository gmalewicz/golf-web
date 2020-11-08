import { AuthenticationService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hole-stake-rules',
  templateUrl: './hole-stake-rules.component.html',
  styleUrls: ['./hole-stake-rules.component.css']
})
export class HoleStakeRulesComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private router: Router) { }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    }
  }
}
