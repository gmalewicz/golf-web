import { Component, OnInit } from '@angular/core';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Round } from '@/_models';
import { HttpService} from '@/_services';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.css']
})
export class RoundsComponent implements OnInit {

  faSearchPlus = faSearchPlus;
  rounds: Array<Round>;
  show: string;

  constructor(private httpService: HttpService) {

    console.log('rounds requested');

    this.httpService.getRounds(1).subscribe((retRounds: Round[]) => {
      console.log(retRounds);
      this.rounds = retRounds;
    });
  }

  ngOnInit(): void {
  }
}
