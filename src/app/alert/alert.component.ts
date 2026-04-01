import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '@/_services';
import { Message } from '@/_models/message';

@Component({
    selector: 'app-alert', template: '',
    standalone: true
})
export class AlertComponent implements OnInit, OnDestroy {
    private readonly alertService = inject(AlertService);
    private readonly _snackBar = inject(MatSnackBar);


    private subscription: Subscription;
    message: Message;

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
