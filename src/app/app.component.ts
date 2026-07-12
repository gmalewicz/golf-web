import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AlertComponent } from './alert/alert.component';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NavigationComponent, AlertComponent, RouterOutlet]
})
export class AppComponent {
  private readonly router = inject(Router);


  title = 'golf-web';
}
