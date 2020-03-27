import { Component } from '@angular/core';
import { Router } from '@angular/router';
//  import { Time } from '@angular/common';
// import { Course, Round } from '@/_models';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'golf-web';

  constructor(
    private router: Router
  ) { }

  /*
    show: string;
    course: Course;
    round: Round;

    selectedAction(event: string): void {
      console.log('selected action: ' + event);
      this.show = event;

    }

    showCourse(event: Course) {
      console.log('execute show curse: ' + event.name);
      this.course = event;
      if (this.show === 'addRound') {
        this.selectedAction('addScorecard');
      } else {
        // display course details
        this.selectedAction('course');
      }
    }

    showRound(event: Round) {
      console.log('execute show round: ' + event.roundDate + ' ' + event.teeTime);
      this.round = event;
      this.selectedAction('round');
    }
  */

}
