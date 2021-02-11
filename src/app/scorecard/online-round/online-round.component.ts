import { AlertService, AuthenticationService, HttpService } from '@/_services';
import { Component } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ScorecardHttpService } from '../_services';
import { OnlineRoundBaseComponent } from '../_helpers/online-round-base';

@Component({
  selector: 'app-online-round',
  templateUrl: './online-round.component.html',
  styleUrls: ['./online-round.component.css']
})
export class OnlineRoundComponent extends OnlineRoundBaseComponent {

  constructor(protected httpService: HttpService,
              protected scorecardHttpService: ScorecardHttpService,
              protected alertService: AlertService,
              protected dialog: MatDialog,
              protected authenticationService: AuthenticationService,
              protected router: Router) {
    super(httpService, scorecardHttpService, alertService, dialog, authenticationService, router);
  }

  // helper function to provide verious arrays for html
  counter(i: number) {
    return new Array(i);
  }
}
