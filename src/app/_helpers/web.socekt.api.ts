import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { AlertService, AuthenticationService } from '@/_services';
import { environment } from 'environments/environment';
export class WebSocketAPI {

   // WS_ENDPOINT = environment.WS_ENDPOINT +  '?token=';
    topic = '/topic';
    stompClient: any;
    appComponent: any;
    lostConnection = false;

    constructor(appComponent: any,
                private alertService: AlertService,
                private authenticationService: AuthenticationService) {
        this.appComponent = appComponent;
    }

    _connect(listen: boolean) {

      console.log('Initialize WebSocket Connection: ' + environment.WS_ENDPOINT);
      const ws = new SockJS(environment.WS_ENDPOINT + this.authenticationService.currentPlayerValue.token);
      this.stompClient = Stomp.over(ws);

      // tslint:disable-next-line: variable-name
      const _this = this;
      _this.stompClient.connect({}, function connectCallback(frame: any) {


        if (_this.lostConnection) {
          _this.alertService.clear();
          _this.lostConnection = false;
          _this.alertService.success('Connection to the server established', false);
        }

        if (listen) {
          _this.stompClient.subscribe(_this.topic, function callback(message: any) {
              _this.onMessageReceived(message);
          });
          _this.stompClient.reconnect_delay = 2000;
        }
      }, (error: any) => {
        console.log('errorCallBack -> ' + error);
        this.alertService.error('Lost connection to the server', false);
        this.lostConnection = true;
        setTimeout(() => {
          this._connect(listen);
        }, 5000);
      });
    }

    _disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        console.log('Disconnected');
    }

    _send(message: any) {
        console.log('api via web socket');
        this.stompClient.send('/app/hole', {}, JSON.stringify(message));
    }

    onMessageReceived(message: any) {
        console.log('Message Recieved from Server :: ' + message);
        // this.appComponent.handleMessage(JSON.stringify(message.body));
        if (this.appComponent != null) {
          this.appComponent.handleMessage(JSON.parse(message.body));
        }
    }
}

