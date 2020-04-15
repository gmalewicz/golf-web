import { Component, OnInit } from '@angular/core';
import { faSearchPlus, faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  faSearchPlus = faSearchPlus;
  faMoneyBillAlt = faMoneyBillAlt;

  constructor() { }

  ngOnInit(): void {
  }

}
