import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { RoundsNavigationService } from '../roundsNavigation.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
    selector: 'app-list-rounds',
    templateUrl: './list-rounds.component.html',
    standalone: true,
    imports: [NgIf, NgFor, RouterLink, FaIconComponent, DatePipe]
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
