import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavigationService } from '../_services/navigation.service';

@Component({
    selector: 'app-online-fb-strokeplay',
    templateUrl: './online-fb-strokeplay.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [NavigationService]
})
export class OnlineFbStrokeplayComponent {

  constructor() {}   
 
}
