import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { AlertService, AuthenticationService } from '@/_services';
import { environment } from 'environments/environment';
export class WebSocketAPI {

   // WS_ENDPOINT = environment.WS_ENDPOINT +  '?token=';
    topic = '/topic';
    stompClient: any;
    appComponent: any;
    lostConnection: boolean;
    acceptMessage: boolean;
    reconnect: boolean;

    constructor(appComponent: any,
                private alertService: AlertService,
                private authenticationService: AuthenticationService,
                acceptMessage: boolean,
                reconnect: boolean) {
        this.appComponent = appComponent;
        this.acceptMessage = acceptMessage;
        this.lostConnection = false;
        this.reconnect = reconnect;

        // console.log(appComponent);
    }

    _connect(listen: boolean) {

      // console.log('Initialize WebSocket Connection: ' + environment.WS_ENDPOINT);
      const ws = new SockJS(environment.WS_ENDPOINT + this.authenticationService.currentPlayerValue.token);
      this.stompClient = Stomp.over(ws);

      // tslint:disable-next-line: variable-name
      const _this = this;
      _this.stompClient.connect({}, function connectCallback(frame: any) {


        if (_this.lostConnection) {
          _this.alertService.clear();
          _this.lostConnection = false;
          // console.log(this.appComponent);
          _this.appComponent.handleLostConnection(false);
          // _this.alertService.success('Connection to the server established', false);
        }

        if (listen) {
          _this.stompClient.subscribe(_this.topic, function callback(message: any) {
              _this.onMessageReceived(message);
          });
          _this.stompClient.reconnect_delay = 2000;
        }
      }, (error: any) => {
        // console.log('errorCallBack -> ' + error);
        this.lostConnection = true;
        this.alertService.error('Lost connection to the server', false);
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
        // console.log('Disconnected');
    }

    _send(message: any) {
        // console.log('api via web socket');
        this.stompClient.send('/app/hole', {}, JSON.stringify(message));
    }

    onMessageReceived(message: any) {
        // console.log('Message Recieved from Server :: ' + message);
        // this.appComponent.handleMessage(JSON.stringify(message.body));
        if (this.acceptMessage) {
          this.appComponent.handleMessage(JSON.parse(message.body));
        }
    }
}

