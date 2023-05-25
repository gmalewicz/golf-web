import { AuthenticationService } from '@/_services/authentication.service';
import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { golfRxStompConfig } from '../_helpers/golfRxStompConfig';
import { AppConfigService } from '@/scorecard/_services/appConfig.service';

@Injectable({
  providedIn: 'root',
})
export class RxStompService extends RxStomp {

  wsEndpointStr: string;
  activePending = false;

  constructor(private authenticationService: AuthenticationService,
              private appConfigService: AppConfigService) {

    super();

    if (document.location.protocol === 'http:') {

      this.wsEndpointStr = 'ws://' + appConfigService.config.wsEndpoint;

    } else {

      this.wsEndpointStr = 'wss://' + appConfigService.config.wsEndpoint;
    }
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
