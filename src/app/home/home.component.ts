import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `<img src="./assets/img/logo.png" alt="Royal Golf Club Wilanów" class="centerImg">`
})
export class HomeComponent implements OnInit {

  ngOnInit(): void {
    // This is intentional
  }
}
