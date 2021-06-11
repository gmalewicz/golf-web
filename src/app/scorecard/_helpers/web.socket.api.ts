import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { AlertService, AuthenticationService } from '@/_services';
import { environment } from 'environments/environment';
export class WebSocketAPI {

    topic = '/topic';
    stompClient: any;
    appComponent: any;
    lostConnection: boolean;
    acceptMessage: boolean;
    reconnect: boolean;
    wsEndpointStr: string;

    constructor(appComponent: any,
                private alertService: AlertService,
                private authenticationService: AuthenticationService,
                acceptMessage: boolean,
                reconnect: boolean) {
        this.appComponent = appComponent;
        this.acceptMessage = acceptMessage;
        this.lostConnection = false;
        this.reconnect = reconnect;

        if (document.location.protocol === 'http:') {

          this.wsEndpointStr = 'http://' + environment.WS_ENDPOINT;

        } else {

          this.wsEndpointStr = 'https://' + environment.WS_ENDPOINT;
        }
    }

    _connect(listen: boolean) {

      const ws = new SockJS(this.wsEndpointStr + this.authenticationService.currentPlayerValue.token);
      this.stompClient = Stomp.over(ws);
      // turn off debug messages to console
      this.stompClient.debug = null;

      // tslint:disable-next-line: variable-name
      const _this = this;
      _this.stompClient.connect({}, function connectCallback(frame: any) {


        if (_this.lostConnection) {
          _this.alertService.clear();
          _this.lostConnection = false;
          _this.appComponent.handleLostConnection(false);
        }

        if (listen) {
          _this.stompClient.subscribe(_this.topic, function callback(message: any) {
              _this.onMessageReceived(message);
          });
          _this.stompClient.reconnect_delay = 2000;
        }
      }, (error: any) => {
        this.lostConnection = true;
        this.appComponent.handleLostConnection(true);
        if (this.reconnect) {
          setTimeout(() => {
            this._connect(listen);
          }, 5000);
        }
      });
    }

    _disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
    }

    _send(message: any) {
        this.stompClient.send('/app/hole', {}, JSON.stringify(message));
    }

    onMessageReceived(message: any) {
        if (this.acceptMessage) {
          this.appComponent.handleMessage(JSON.parse(message.body));
        }
    }
}

