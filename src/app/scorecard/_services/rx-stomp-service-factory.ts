import { AuthenticationService } from '@/_services/authentication.service';
import { RxStompService } from './rx-stomp.service';
import { AppConfigService } from '@/scorecard/_services/appConfig.service';

export function rxStompServiceFactory(authenticationService: AuthenticationService, appConfigService: AppConfigService) {
  const rxStomp = new RxStompService(authenticationService, appConfigService);
  rxStomp.activate();
  return rxStomp;
}
