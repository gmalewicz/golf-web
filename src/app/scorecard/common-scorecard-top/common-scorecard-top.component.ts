import { Component, Input, OnInit, input } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';
import { CommonScorecardComponent } from '../common-scorecard/common-scorecard.component';
import { OnlineNavComponent } from '../online-nav/online-nav.component';

@Component({
    selector: 'app-common-scorecard-top',
    templateUrl: './common-scorecard-top.component.html',
    standalone: true,
    imports: [OnlineNavComponent, CommonScorecardComponent]
})
export class CommonScorecardTopComponent implements OnInit {

  curHoleIdx = input.required<number>();
  curHoleStrokes = input.required<number[]>();
  curHolePutts = input.required<number[]>();
  curHolePenalties = input.required<number[]>();
  rounds = input.required<OnlineRound[]>();
  ballPickedUp = input.required<boolean>();
  totalStrokes = input.required<number[]>();
  penaltySelectorActive = input.required<{active: boolean}[]>();
  curPlayerIdx = input.required<number>();
  puttSelectorActive = input.required<{active: boolean}[]>();
  inProgress = input.required<boolean>();

  @Input() public counter: (i: number) => number[];
  @Input() public calculateStyle: (i: number) => string;
  @Input() public addScore: () => void;


  ngOnInit() {
    // This is intentional
  }

}
