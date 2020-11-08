import { Component, OnInit } from '@angular/core';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Round } from '@/_models';
import { HttpService, AuthenticationService} from '@/_services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html',
  styleUrls: ['./rounds.component.css']
})
export class RoundsComponent implements OnInit {

  faSearchPlus: IconDefinition;
  rounds: Array<Round>;
  show: string;

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      this.faSearchPlus = faSearchPlus;
      // console.log('rounds requested');

      this.httpService.getRounds(this.authenticationService.currentPlayerValue.id).subscribe((retRounds: Round[]) => {
        // console.log(retRounds);
        this.rounds = retRounds;
      });
    }
  }
}
