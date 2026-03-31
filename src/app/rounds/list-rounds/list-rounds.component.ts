import { AuthenticationService } from '@/_services/authentication.service';
import { Component, OnInit, inject } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { RoundsNavigationService } from '../roundsNavigation.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Format } from '@/_models/format';

@Component({
    selector: 'app-list-rounds',
    templateUrl: './list-rounds.component.html',
    imports: [RouterLink, FaIconComponent, DatePipe]
})
export class ListRoundsComponent implements OnInit {
  authenticationService = inject(AuthenticationService);
  roundsNavigationService = inject(RoundsNavigationService);


  Format = Format;

  faSearchPlus: IconDefinition;

  ngOnInit(): void {

    this.faSearchPlus = faSearchPlus;
  }

}
