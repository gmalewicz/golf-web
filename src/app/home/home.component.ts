import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-home',
    template: `
        <img src="./assets/img/DGNG.png" alt="DGNG"  class="centerImg">
        <img src="./assets/img/DrevnyKocurCup.png" alt="DrevnyKocurCup"  class="centerImg">
        <img src="./assets/img/logo.png" alt="Royal Golf Club Wilanów"  class="centerImg">
    `,
    standalone: true
})
export class HomeComponent implements OnInit {

  ngOnInit(): void {
    // This is intentional
  }
}
