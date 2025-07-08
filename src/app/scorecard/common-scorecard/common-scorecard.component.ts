import { Component, Input, OnInit, Signal, input } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';
import { NgTemplateOutlet, NgClass } from '@angular/common';
import { RangePipe } from "../../_helpers/range";

@Component({
    selector: 'app-common-scorecard',
    templateUrl: './common-scorecard.component.html',
    imports: [NgTemplateOutlet, NgClass, RangePipe]
})
export class CommonScorecardComponent implements OnInit {

  curHoleIdx = input.required<number>();
  curHoleStrokes = input.required<number[]>();
  curHolePutts = input.required<number[]>();
  curHolePenalties = input.required<number[]>();
  @Input() public roundsSgn: Signal<OnlineRound[]>;
  ballPickedUp = input.required<boolean>();
  totalStrokes = input.required<number[]>();
  @Input () public curPlayerStyle: Signal<string[]>;

  ngOnInit() {
     // This is intentional
  }
}
