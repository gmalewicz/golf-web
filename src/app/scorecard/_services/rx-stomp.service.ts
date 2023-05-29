import { AuthenticationService } from '@/_services/authentication.service';
import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { golfRxStompConfig } from '../_helpers/golfRxStompConfig';
import { ScorecardHttpService } from './scorecardHttp.service';

@Injectable({
  providedIn: 'root',
})
export class RxStompService extends RxStomp {

  wsEndpointStr: string;
  activePending = false;

  constructor(private authenticationService: AuthenticationService,
              private scorecardHttpService: ScorecardHttpService) {

    super();

    this.scorecardHttpService.getAppConfig().subscribe({

      next: (data) => {
        if (document.location.protocol === 'http:') {

          this.wsEndpointStr = 'ws://' + data.wsEndpoint;

        } else {

          this.wsEndpointStr = 'wss://' + data.wsEndpoint;
        }
      },
      error: () => {

        if (document.location.protocol === 'http:') {

          this.wsEndpointStr = 'ws://' + "dgng.pl/websocket/onlinescorecard?token=";

        } else {

          this.wsEndpointStr = 'wss://' + "dgng.pl/websocket/onlinescorecard?token=";
        }
      },

    })
  }

  activate(): void {

    if (this.activePending) {
      return;
    } else {
      this.activePending = true;
    }

    this.authenticationService.updateJWT().subscribe(() => {
      golfRxStompConfig.brokerURL = this.wsEndpointStr + this.authenticationService.currentPlayerValue.token;
      super.configure(golfRxStompConfig);
      super.activate();
      return this;
    });
  }

  deactivate(): Promise<void> {

    this.activePending = false;
    return super.deactivate();
  }
}
