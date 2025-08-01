import { Component, Input, OnInit, input } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { OnlineNavComponent } from '../online-nav/online-nav.component';

@Component({
    selector: 'app-common-scorecard-top',
    templateUrl: './common-scorecard-top.component.html',
    imports: [OnlineNavComponent, CommonScorecardComponent]
})
export class CommonScorecardTopComponent implements OnInit {

  curHoleIdxSgn = input.required<number>();
  curHoleStrokesSgn = input.required<number[]>();
  curHolePuttsSgn = input.required<number[]>();
  curHolePenaltiesSgn = input.required<number[]>();
  
  ballPickedUpSgn = input.required<boolean>();
  totalStrokesSgn = input.required<number[]>();
  penaltySelectorActiveSgn = input.required<{active: boolean}[]>();
  curPlayerIdxSgn = input.required<number>();
  puttSelectorActiveSgn = input.required<{active: boolean}[]>();
  inProgressSgn = input.required<boolean>();
  curPlayerStyleSgn = input.required<string[]>();
  roundsSgn = input.required<OnlineRound[]>();
  @Input() public addScore: () => void;

  ngOnInit() {
    // This is intentional
  }

}
