import { OnlineRound } from '@/_models/onlineRound';
import { AuthenticationService, HttpService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';



@Component({
  selector: 'app-online-score-card',
  templateUrl: './online-score-card.component.html',
  styleUrls: ['./online-score-card.component.css']
})
export class OnlineScoreCardComponent implements OnInit {

  display = false;
  onlineRounds: OnlineRound[];
  faSearchPlus = faSearchPlus;
  myOnlineRounds: OnlineRound[];

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private router: Router) {

    this.httpService.getOnlineRounds().subscribe((retOnlineRounds: OnlineRound[]) => {

      // initialize this player round if any
      this.myOnlineRounds = retOnlineRounds.filter(v => v.owner === authenticationService.currentPlayerValue.id);

      console.log(this.myOnlineRounds);

      // set all rounds except the one for this player
      this.onlineRounds = retOnlineRounds.filter(v => v.owner !== authenticationService.currentPlayerValue.id);
      console.log(this.onlineRounds);

      this.display = true;
    });

  }

  ngOnInit(): void {
    // this.webSocketAPI = new WebSocketAPI(new OnlineScoreCardComponent());
  }

  showForRound(courseId: number) {
    console.log('show for round executed');
  }


}
