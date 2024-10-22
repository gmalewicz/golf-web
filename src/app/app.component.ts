import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AlertComponent } from './alert/alert.component';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [NavigationComponent, AlertComponent, RouterOutlet]
})
export class AppComponent {

  title = 'golf-web';

  constructor(
    private readonly router: Router
  ) { }
}
