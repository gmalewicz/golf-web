import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService } from '@/_services';
import { Message } from '@/_models/message';

@Component({ selector: 'app-alert', templateUrl: 'alert.component.html' })
export class AlertComponent implements OnInit, OnDestroy {

    private subscription: Subscription;
    message: Message;

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getAlert()
            .subscribe(message => {
                switch (message?.type) {
                    case 'success':
                        message.cssClass = 'alert alert-success';
                        break;
                    case 'error':
                        message.cssClass = 'alert alert-danger';
                        break;
                }

                this.message = message;
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
