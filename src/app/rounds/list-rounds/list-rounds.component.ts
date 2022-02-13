import { Round } from '@/_models/round';
import { Component, Input, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-list-rounds',
  templateUrl: './list-rounds.component.html',
  styleUrls: ['./list-rounds.component.css']
})
export class ListRoundsComponent implements OnInit {

  @Input() rounds: Round[];
  @Input() selectedTab: number;

  faSearchPlus: IconDefinition;

  constructor() {
     // This is intentional
  }

  ngOnInit(): void {

    this.faSearchPlus = faSearchPlus;
  }

}
