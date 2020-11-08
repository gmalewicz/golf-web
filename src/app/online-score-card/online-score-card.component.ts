import { OnlineRound } from '@/_models/onlineRound';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-online-score-card',
  templateUrl: './online-score-card.component.html',
  styleUrls: ['./online-score-card.component.css']
})
export class OnlineScoreCardComponent implements OnInit {

  display: boolean;
  onlineRounds: OnlineRound[];
  faSearchPlus: IconDefinition;
  myOnlineRounds: OnlineRound[];

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/']);
    } else {

      // initialization
      this.display = false;
      this.faSearchPlus = faSearchPlus;

      this.httpService.getOnlineRounds().subscribe((retOnlineRounds: OnlineRound[]) => {

        // initialize this player open round if any
        this.myOnlineRounds = retOnlineRounds.filter(v => v.owner ===
          this.authenticationService.currentPlayerValue.id && v.finalized === false);

        // console.log(this.myOnlineRounds);

        // set all rounds except the open one for this player
        this.onlineRounds = retOnlineRounds.filter(v => v.owner !==
          this.authenticationService.currentPlayerValue.id || v.finalized === true);
        // console.log(this.onlineRounds);

        this.display = true;
      });
    }
  }
}
