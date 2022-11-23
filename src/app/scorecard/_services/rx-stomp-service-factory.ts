import { AuthenticationService } from '@/_services/authentication.service';
import { RxStompService } from './rx-stomp.service';

export function rxStompServiceFactory(authenticationService: AuthenticationService) {
  const rxStomp = new RxStompService(authenticationService);
  rxStomp.activate();
  return rxStomp;
}
