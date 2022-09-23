import { AuthenticationService } from '@/_services';
import { environment } from 'environments/environment';
import { RxStompState } from '@stomp/rx-stomp';
import { map, Observable } from 'rxjs';
import { RxStompService } from '@stomp/ng2-stompjs';

export class WebSocketAPI2 {

    rxStomp: RxStompService;
    wsEndpointStr: string;
    public connectionStatus$: Observable<boolean>;
    public messageQueue$: Observable<any>;
    topic = '/topic';
    receivedMessages: any;

    constructor(private authenticationService: AuthenticationService) {

        if (document.location.protocol === 'http:') {

          this.wsEndpointStr = 'ws://' + environment.WS_ENDPOINT;

        } else {

          this.wsEndpointStr = 'wss://' + environment.WS_ENDPOINT;
        }

        this.rxStomp = null;
    }

    _connect(listen: boolean) {


      if (this.rxStomp !== null) {
        return;
      }

      this.rxStomp = new RxStompService();

      if (listen) {
        this.messageQueue$ = this.rxStomp.watch(this.topic);
      }

      this.authenticationService.updateJWT().subscribe(() => {
        this.rxStomp.configure({
          brokerURL: this.wsEndpointStr + this.authenticationService.currentPlayerValue.token,
          connectHeaders: {
          },
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 0,
          reconnectDelay: 200,

          debug: (msg: string): void => {
            console.log(new Date(), msg);
          }

        });

        this.rxStomp.activate();

        this.connectionStatus$ = this.rxStomp.connectionState$.pipe(
          map(state => {
            // convert numeric RxStompState to string
            if (RxStompState[state] === 'OPEN') {
              return true;
            }
            return false;
          })
        );
      });
    }

    _reconnect() {

      const prom = this.rxStomp.deactivate();

      prom.then(() =>{
        this.rxStomp.activate();

        this.connectionStatus$ = this.rxStomp.connectionState$.pipe(
          map(state => {
            // convert numeric RxStompState to string
            if (RxStompState[state] === 'OPEN') {
              return true;
            }
            return false;
          })
        );
      });
    }


    _disconnect() {
        this.rxStomp.deactivate();
    }

    _send(message: any) {
        this.rxStomp.publish({ destination: '/app/hole', body: JSON.stringify(message) });
    }
}

