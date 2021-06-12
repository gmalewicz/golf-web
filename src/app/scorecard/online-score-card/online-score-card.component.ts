
import { Course } from '@/_models/course';
import { AuthenticationService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { OnlineRound } from '../_models';
import { ScorecardHttpService } from '../_services';

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
  courses: Map<number, Course>;

  constructor(private scorecardHttpService: ScorecardHttpService,
              private authenticationService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      // initialization
      this.display = false;
      this.faSearchPlus = faSearchPlus;

      this.scorecardHttpService.getOnlineRounds().subscribe((retOnlineRounds: OnlineRound[]) => {

        // initialize this player open round if any
        this.myOnlineRounds = retOnlineRounds.filter(v => v.owner ===
          this.authenticationService.currentPlayerValue.id && v.finalized === false);

        // set all rounds except the open one for this player
        this.onlineRounds = retOnlineRounds.filter(v => v.owner !==
          this.authenticationService.currentPlayerValue.id || v.finalized === true);

        this.courses = new Map();
        for (const or of this.onlineRounds) {
          this.courses.set(or.course.id , or.course);
        }

        this.display = true;
      });
    }
  }
}
