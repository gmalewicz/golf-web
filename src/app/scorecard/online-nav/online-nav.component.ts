import { Component, Input, OnInit } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';

@Component({
  selector: 'app-online-nav',
  templateUrl: './online-nav.component.html'
})
export class OnlineNavComponent implements OnInit {

  @Input() curHoleStrokes: number[];
  @Input() curPlayerIdx: number;
  @Input() puttSelectorActive: { active: boolean }[];
  @Input() onlineRounds: OnlineRound[];
  @Input() curHolePutts: number[];
  @Input() curHolePenalties: number[];
  @Input() penaltySelectorActive: { active: boolean }[];
  @Input() public addScore: () => void;

  public buttons: number[];

  constructor() {
    // This is intentional
  }

  ngOnInit(): void {
    this.buttons = [0, 1, 2, 3, 4, 5];
  }

  onPickUp() {
    // 16 is agreed number of pick up hole
    this.curHoleStrokes[this.curPlayerIdx] = 16;
  }

  onDecrease() {
    // number of strokes canot be lower than 1
    if (this.curHoleStrokes[this.curPlayerIdx] === 1) {
      return;
    }
    this.curHoleStrokes[this.curPlayerIdx]--;

  }

  onIncrease() {

    // number of strokes canot be greater than 15
    if (this.curHoleStrokes[this.curPlayerIdx] >= 15) {
      return;
    }
    this.curHoleStrokes[this.curPlayerIdx]++;
  }

  selectPutt(putts: number) {
    this.curHolePutts[this.curPlayerIdx] = putts;
  }

  selectPenalty(penalties: number) {
    this.curHolePenalties[this.curPlayerIdx] = penalties;
  }
}
