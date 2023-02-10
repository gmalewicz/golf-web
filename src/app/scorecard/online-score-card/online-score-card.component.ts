import { NavigationService } from './../_services/navigation.service';
import { Course } from '@/_models/course';
import { AuthenticationService } from '@/_services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faSearchPlus, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { OnlineRound } from '../_models';
import { ScorecardHttpService } from '../_services';

@Component({
  selector: 'app-online-score-card',
  templateUrl: './online-score-card.component.html'
})
export class OnlineScoreCardComponent implements OnInit {

  display: boolean;
  onlineRounds: OnlineRound[];
  faSearchPlus: IconDefinition;
  myOnlineRounds: OnlineRound[];
  courses: Map<number, Course>;

  constructor(private scorecardHttpService: ScorecardHttpService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private navigationService: NavigationService) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      // initialization
      this.display = false;
      this.faSearchPlus = faSearchPlus;
      this.navigationService.clear();

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

  continueRound(navigation: string) {
    this.navigationService.setCourse(this.myOnlineRounds[0].course);
    this.navigationService.setOnlineRounds(this.myOnlineRounds);
    this.router.navigate(['/scorecard/' + navigation]);
  }

  viewRound(viewType: number, course: Course, onlineRound: OnlineRound) {

    switch (viewType)  {
      case 1: { // view for course
        this.navigationService.setCourse(course);
        break;
      }
      case 2: { // view for player
        this.navigationService.setOnlineRounds([onlineRound]);
        break;
      }
      case 3: { // view for MP round
        this.navigationService.setOwner(onlineRound.owner);
        this.navigationService.setCourse(course);
        this.navigationService.setOnlineRounds([onlineRound]);
        break;
      }
    }

    this.router.navigate(['/scorecard/onlineScoreCardView']);
  }
}
