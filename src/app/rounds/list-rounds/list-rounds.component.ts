import { Round } from '@/_models/round';
import { AuthenticationService } from '@/_services/authentication.service';
import { Component, Input, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-list-rounds',
  templateUrl: './list-rounds.component.html'
})
export class ListRoundsComponent implements OnInit {

  @Input() rounds: Round[];
  @Input() selectedTab: number;

  faSearchPlus: IconDefinition;

  constructor(public authenticationService: AuthenticationService) {
     // This is intentional
  }

  ngOnInit(): void {

    this.faSearchPlus = faSearchPlus;
  }

}
