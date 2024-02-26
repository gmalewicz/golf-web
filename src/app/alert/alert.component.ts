import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '@/_services';
import { Message } from '@/_models/message';

@Component({ selector: 'app-alert', templateUrl: 'alert.component.html' })
export class AlertComponent implements OnInit, OnDestroy {

    private subscription: Subscription;
    message: Message;

    constructor(private alertService: AlertService, private _snackBar: MatSnackBar) { }

    ngOnInit() {
        this.subscription = this.alertService.getAlert()
            .subscribe(message => {
                this.message = message;
                this._snackBar.open(message.text,  $localize`:@@alert-close:Close` , {verticalPosition: 'top', duration: 5000});
            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
