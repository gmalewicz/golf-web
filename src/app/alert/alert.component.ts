import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '@/_services';
import { Message } from '@/_models/message';

@Component({ selector: 'app-alert', template: '' })
export class AlertComponent implements OnInit, OnDestroy {

    private subscription: Subscription;
    message: Message;

    constructor(private alertService: AlertService, private _snackBar: MatSnackBar) { }

    ngOnInit() {
        this.subscription = this.alertService.getAlert()
            .subscribe(message => {
              switch (message?.type) {
                case 'success':
                  this._snackBar.open(message.text,  $localize`:@@alert-close:Close` , {verticalPosition: 'top', duration: 2000});
                    break;
                case 'error':
                  this._snackBar.open(message.text,  $localize`:@@alert-close:Close` , {verticalPosition: 'top'});
                    break;
              }
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
