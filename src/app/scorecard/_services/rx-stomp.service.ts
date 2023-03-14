import { AuthenticationService } from '@/_services/authentication.service';
import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { environment } from 'environments/environment';
import { golfRxStompConfig } from '../_helpers/golfRxStompConfig';

@Injectable({
  providedIn: 'root',
})
export class RxStompService extends RxStomp {

  wsEndpointStr: string;
  activePending = false;

  constructor(private authenticationService: AuthenticationService) {

    super();

    if (document.location.protocol === 'http:') {

      this.wsEndpointStr = 'ws://' + environment.WS_ENDPOINT;

    } else {

      this.wsEndpointStr = 'wss://' + environment.WS_ENDPOINT;
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
      golfRxStompConfig.debug = (msg: string): void => {console.log(new Date(), msg);};
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
