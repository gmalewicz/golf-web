import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { RoundsNavigationService } from '../roundsNavigation.service';

@Component({
  selector: 'app-list-rounds',
  templateUrl: './list-rounds.component.html'
})
export class ListRoundsComponent implements OnInit {

  faSearchPlus: IconDefinition;

  constructor(public authenticationService: AuthenticationService,
              public roundsNavigationService: RoundsNavigationService) {
     // This is intentional
  }

  ngOnInit(): void {

    this.faSearchPlus = faSearchPlus;
  }

}
