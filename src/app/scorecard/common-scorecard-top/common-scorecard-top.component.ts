import { Component, Input, OnInit, Signal, input } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { OnlineNavComponent } from '../online-nav/online-nav.component';

@Component({
    selector: 'app-common-scorecard-top',
    templateUrl: './common-scorecard-top.component.html',
    imports: [OnlineNavComponent, CommonScorecardComponent]
})
export class CommonScorecardTopComponent implements OnInit {

  curHoleIdx = input.required<number>();
  curHoleStrokes = input.required<number[]>();
  curHolePutts = input.required<number[]>();
  curHolePenalties = input.required<number[]>();
  
  ballPickedUp = input.required<boolean>();
  totalStrokes = input.required<number[]>();
  penaltySelectorActive = input.required<{active: boolean}[]>();
  curPlayerIdx = input.required<number>();
  puttSelectorActive = input.required<{active: boolean}[]>();
  inProgress = input.required<boolean>();
  @Input () public curPlayerStyle: Signal<string[]>;
  @Input() public addScore: () => void;
  @Input() public roundsSgn: Signal<OnlineRound[]>;


  ngOnInit() {
    // This is intentional
  }

}
