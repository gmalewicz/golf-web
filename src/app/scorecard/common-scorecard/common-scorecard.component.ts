import { Component, Input, OnInit } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';

@Component({
  selector: 'app-common-scorecard',
  template: `
<table id="holeStake-tbl" class="table table-bordered" aria-describedby="Online round hole result" style="font-size: 18px;">
  <thead>
    <tr>
      <ng-template [ngTemplateOutlet]="TableHeader"></ng-template>
    </tr>
  </thead>
  <tbody>
    <tr style="font-weight: bold;">
      <td>
        {{curHoleIdx + 1}}
      </td>
      <td [ngClass]="calculateStyle(0)">
        <span *ngIf="curHoleStrokes[0] > 0 && curHoleStrokes[0] < 16">{{curHoleStrokes[0]}}</span>
        <span *ngIf="curHoleStrokes[0] === 16">x</span>
        <span class="supsub">
          <span class="superscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePutts[0])">
              <span class="blackDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
          <span class="subscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePenalties[0])">
              <span class="redDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
        </span>
      </td>
      <td *ngIf="onlineRounds.length > 1" [ngClass]="calculateStyle(1)">
        <span *ngIf="curHoleStrokes[1] > 0 && curHoleStrokes[1] < 16">{{curHoleStrokes[1]}}</span>
        <span *ngIf="curHoleStrokes[1] === 16">x</span>
        <span class="supsub">
          <span class="superscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePutts[1])">
              <span class="blackDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
          <span class="subscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePenalties[1])">
              <span class="redDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
        </span>
      </td>
      <td *ngIf="onlineRounds.length > 2" [ngClass]="calculateStyle(2)">
        <span *ngIf="curHoleStrokes[2] > 0 && curHoleStrokes[2] < 16">{{curHoleStrokes[2]}}</span>
        <span *ngIf="curHoleStrokes[2] === 16">x</span>
        <span class="supsub">
          <span class="superscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePutts[2])">
              <span class="blackDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
          <span class="subscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePenalties[2])">
              <span class="redDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
        </span>
      </td>
      <td *ngIf="onlineRounds.length > 3" [ngClass]="calculateStyle(3)">
        <span *ngIf="curHoleStrokes[3] > 0 && curHoleStrokes[3] < 16">{{curHoleStrokes[3]}}</span>
        <span *ngIf="curHoleStrokes[3] === 16">x</span>
        <span class="supsub">
          <span class="superscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePutts[3])">
              <span class="blackDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
          <span class="subscript">
            <span class="dotSeparator"></span>
            <span *ngFor="let i = index of counter(curHolePenalties[3])">
              <span class="redDot"></span>
              <span class="dotSeparator"></span>
            </span>
          </span>
        </span>
      </td>
    </tr>
  </tbody>
</table>
<ng-template #TableHeader >
  <th id="hole">Hole</th>
  <th id="p1str">{{onlineRounds[0].player.nick}}
    <span *ngIf="ballPickedUp[0]">
      (x)
    </span>
    <span *ngIf="!ballPickedUp[0]">
      ({{totalStrokes[0]}})
    </span>
  </th>
  <th id="p2str" *ngIf="onlineRounds.length > 1">{{onlineRounds[1].player.nick}}
    <span *ngIf="ballPickedUp[1]">
      (x)
    </span>
    <span *ngIf="!ballPickedUp[1]">
      ({{totalStrokes[1]}})
    </span>
  </th>
  <th id="p3str" *ngIf="onlineRounds.length > 2">{{onlineRounds[2].player.nick}}
    <span *ngIf="ballPickedUp[2]">
      (x)
    </span>
    <span *ngIf="!ballPickedUp[2]">
      ({{totalStrokes[2]}})
    </span>
  </th>
  <th id="p4str" *ngIf="onlineRounds.length > 3">{{onlineRounds[3].player.nick}}
    <span *ngIf="ballPickedUp[3]">
      (x)
    </span>
    <span *ngIf="!ballPickedUp[3]">
      ({{totalStrokes[3]}})
    </span>
  </th>
</ng-template>
  `
})
export class CommonScorecardComponent implements OnInit {

  @Input() curHoleIdx: number;
  @Input() curHoleStrokes: number[];
  @Input() curHolePutts: number[];
  @Input() curHolePenalties: number[];
  @Input() onlineRounds: OnlineRound[];
  @Input() ballPickedUp: boolean;
  @Input() totalStrokes: number[];
  @Input() public counter: (i: number) => number[];
  @Input() public calculateStyle: (i: number) => string;

  constructor() {
     // This is intentional
  }

  ngOnInit() {
     // This is intentional
  }

  tableHeader() {
    return 'TableHeader';
  }

}
