import { Component, Input, OnInit } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';

@Component({
  selector: 'app-common-scorecard-top',
  templateUrl: './common-scorecard-top.component.html'
})
export class CommonScorecardTopComponent implements OnInit {

  @Input() curHoleIdx: number;
  @Input() curHoleStrokes: number[];
  @Input() curHolePutts: number[];
  @Input() curHolePenalties: number[];
  @Input() public rounds: OnlineRound[];
  @Input() ballPickedUp: boolean;
  @Input() totalStrokes: number[];
  @Input() public counter: (i: number) => number[];
  @Input() public calculateStyle: (i: number) => string;
  @Input() penaltySelectorActive: { active: boolean }[];
  @Input() public addScore: () => void;
  @Input() curPlayerIdx: number;
  @Input() puttSelectorActive: { active: boolean }[];

  constructor() {
    // This is intentional
  }

  ngOnInit() {
    // This is intentional
  }

}
