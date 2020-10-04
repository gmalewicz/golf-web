import { Component, OnInit } from '@angular/core';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { Round } from '@/_models';
import { HttpService, AuthenticationService} from '@/_services';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.css']
})
export class RoundsComponent implements OnInit {

  faSearchPlus = faSearchPlus;
  rounds: Array<Round>;
  show: string;

  constructor(private httpService: HttpService, private authenticationService: AuthenticationService) {

    // console.log('rounds requested');

    this.httpService.getRounds(this.authenticationService.currentPlayerValue.id).subscribe((retRounds: Round[]) => {
      console.log(retRounds);
      this.rounds = retRounds;
    });
  }

  ngOnInit(): void {
  }
}
