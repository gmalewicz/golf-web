import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertService } from '@/_services';

@Component({
    selector: 'app-alert', template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
    private readonly alertService = inject(AlertService);
    private readonly snackBar = inject(MatSnackBar);

    constructor() {
        this.alertService.getAlert()
            .pipe(takeUntilDestroyed())
            .subscribe(message => {
                switch (message?.type) {
                    case 'success':
                        this.snackBar.open(message.text, $localize`:@@alert-close:Close`, { verticalPosition: 'top', duration: 2000 });
                        break;
                    case 'error':
                        this.snackBar.open(message.text, $localize`:@@alert-close:Close`, { verticalPosition: 'top' });
                        break;
                }
            });
    }
}
