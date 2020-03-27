import { NavigatorService } from '@/_services/navigator';

import { Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {


  constructor(private navigatorService: NavigatorService) { }

  ngOnInit(): void {}
}
