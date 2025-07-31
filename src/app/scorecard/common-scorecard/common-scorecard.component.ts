import { Component, OnInit, input } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';
import { NgTemplateOutlet, NgClass } from '@angular/common';
import { RangePipe } from "../../_helpers/range";

@Component({
    selector: 'app-common-scorecard',
    templateUrl: './common-scorecard.component.html',
    imports: [NgTemplateOutlet, NgClass, RangePipe]
})
export class CommonScorecardComponent {

  curHoleIdxSgn = input.required<number>();
  curHoleStrokesSgn = input.required<number[]>();
  curHolePuttsSgn = input.required<number[]>();
  curHolePenaltiesSgn = input.required<number[]>();
  roundsSgn =  input.required<OnlineRound[]>();
  ballPickedUpSgn = input.required<boolean>();
  totalStrokesSgn = input.required<number[]>();
  curPlayerStyleSgn = input.required<string[]>();
}
