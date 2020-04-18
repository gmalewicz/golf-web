import { Component, OnInit } from '@angular/core';
import { faSearchPlus, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  faSearchPlus = faSearchPlus;
  faPlay = faPlay;

  constructor() { }

  ngOnInit(): void {
  }

}
