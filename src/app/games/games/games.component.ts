import { Component, OnInit } from '@angular/core';
import { faSearchPlus, faPlay, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { AuthenticationService } from '@/_services';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  faSearchPlus: IconDefinition;
  faPlay: IconDefinition;

  constructor(private router: Router,
              private authenticationService: AuthenticationService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {
      this.faSearchPlus = faSearchPlus;
      this.faPlay = faPlay;
    }
  }

  onLastGames() {

    this.router.navigate(['lastGames'], { relativeTo: this.route });

  }

}
