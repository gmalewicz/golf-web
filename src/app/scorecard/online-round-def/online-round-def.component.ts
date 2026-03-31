import { Course, Format } from '@/_models';
import { AlertService, AuthenticationService } from '@/_services';
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router  } from '@angular/router';
import { PlayerSelectorComponent } from "./player-selector/player-selector.component";


@Component({
    selector: 'app-online-round-def',
    templateUrl: './online-round-def.component.html',
    imports: [
      PlayerSelectorComponent
    ],
    providers: []
})
export class OnlineRoundDefComponent implements OnInit {
  protected alertService = inject(AlertService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);


  Format = Format;

  courseSgn = signal<Course>(undefined);
  displaySgn = signal(false);
  formatSgn = signal<Format>(undefined);

  ngOnInit(): void {
    if (
      history.state.data === undefined ||
      this.authenticationService.currentPlayerValue === null
    ) {
      this.authenticationService.logout();
      this.router.navigate(['/login']).catch(error => console.log(error));
    } else {
      // initialization
      this.displaySgn.set(false);
      this.getCourseData();
      this.formatSgn.set(Format.STROKE_PLAY);
    }
  }

  private getCourseData() {
    // grab course from the history
    this.courseSgn.set(history.state.data.course);
    this.displaySgn.set(true);
  }

  changeFormat(format: Format) {
    this.formatSgn.set(format);
  }
}

