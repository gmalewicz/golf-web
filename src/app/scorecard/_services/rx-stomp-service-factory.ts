import { RxStompService } from './rx-stomp.service';

export function rxStompServiceFactory() {
  const rxStomp = new RxStompService();
  rxStomp.activate();
  return rxStomp;
}
