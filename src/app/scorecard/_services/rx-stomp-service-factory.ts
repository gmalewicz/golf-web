import { AuthenticationService } from '@/_services/authentication.service';
import { RxStompService } from './rx-stomp.service';
import { ScorecardHttpService } from './scorecardHttp.service';

export function rxStompServiceFactory(authenticationService: AuthenticationService, scorecardHttpService: ScorecardHttpService) {
  const rxStomp = new RxStompService(authenticationService, scorecardHttpService);
  rxStomp.activate();
  return rxStomp;
}
