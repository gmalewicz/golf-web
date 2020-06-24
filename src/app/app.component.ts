import { Component } from '@angular/core';
import { Router } from '@angular/router';
//  import { Time } from '@angular/common';
// import { Course, Round } from '@/_models';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'golf-web';

  constructor(
    private router: Router
  ) { }
}
