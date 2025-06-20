import { Component, Input, OnInit, input } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';
import { NgTemplateOutlet, NgClass } from '@angular/common';
import { RangePipe } from "../../_helpers/range";

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
        {{curHoleIdx() + 1}}
      </td>
      <td [ngClass]="calculateStyle(0)">
        @if (curHoleStrokes()[0] > 0 && curHoleStrokes()[0] < 16) {
          <span>{{curHoleStrokes()[0]}}</span>
        }
        @if (curHoleStrokes()[0] === 16) {
          <span>x</span>
        }
        <span class="supsub">
          <span class="superscript">
            <span class="dotSeparator"></span>
            @for (index of curHolePutts()[0] | range; track index) {
              <span>
                <span class="blackDot"></span>
                <span class="dotSeparator"></span>
              </span>
            }
          </span>
          <span class="subscript">
            <span class="dotSeparator"></span>
            @for (index of curHolePenalties()[0] | range; track index) {
              <span>
                <span class="redDot"></span>
                <span class="dotSeparator"></span>
              </span>
            }
          </span>
        </span>
      </td>
      @if (rounds().length > 1) {
        <td [ngClass]="calculateStyle(1)">
          @if (curHoleStrokes()[1] > 0 && curHoleStrokes()[1] < 16) {
            <span>{{curHoleStrokes()[1]}}</span>
          }
          @if (curHoleStrokes()[1] === 16) {
            <span>x</span>
          }
          <span class="supsub">
            <span class="superscript">
              <span class="dotSeparator"></span>
              @for (index of curHolePutts()[1] | range; track index) {
                <span>
                  <span class="blackDot"></span>
                  <span class="dotSeparator"></span>
                </span>
              }
            </span>
            <span class="subscript">
              <span class="dotSeparator"></span>
              @for (index of curHolePenalties()[1] | range; track index) {
                <span>
                  <span class="redDot"></span>
                  <span class="dotSeparator"></span>
                </span>
              }
            </span>
          </span>
        </td>
      }
      @if (rounds().length > 2) {
        <td [ngClass]="calculateStyle(2)">
          @if (curHoleStrokes()[2] > 0 && curHoleStrokes()[2] < 16) {
            <span>{{curHoleStrokes()[2]}}</span>
          }
          @if (curHoleStrokes()[2] === 16) {
            <span>x</span>
          }
          <span class="supsub">
            <span class="superscript">
              <span class="dotSeparator"></span>
              @for (putt of curHolePutts()[2] | range; track putt) {
                <span>
                  <span class="blackDot"></span>
                  <span class="dotSeparator"></span>
                </span>
              }
            </span>
            <span class="subscript">
              <span class="dotSeparator"></span>
              @for (penalty of curHolePenalties()[2] | range; track penalty) {
                <span>
                  <span class="redDot"></span>
                  <span class="dotSeparator"></span>
                </span>
              }
            </span>
          </span>
        </td>
      }
      @if (rounds().length > 3) {
        <td [ngClass]="calculateStyle(3)">
          @if (curHoleStrokes()[3] > 0 && curHoleStrokes()[3] < 16) {
            <span>{{curHoleStrokes()[3]}}</span>
          }
          @if (curHoleStrokes()[3] === 16) {
            <span>x</span>
          }
          <span class="supsub">
            <span class="superscript">
              <span class="dotSeparator"></span>
              @for (putt of curHolePutts()[3] | range; track putt) {
                <span>
                  <span class="blackDot"></span>
                  <span class="dotSeparator"></span>
                </span>
              }
            </span>
            <span class="subscript">
              <span class="dotSeparator"></span>
              @for (penalty of curHolePenalties()[3] | range; track penalty) {
                <span>
                  <span class="redDot"></span>
                  <span class="dotSeparator"></span>
                </span>
              }
            </span>
          </span>
        </td>
      }
    </tr>
  </tbody>
</table>
<ng-template #TableHeader >
  <th id="hole" i18n="@@comScor-hole">Hole</th>
  <th id="p1str">{{rounds()[0].player.nick}}
    @if (ballPickedUp()[0]) {
      <span>
        (x)
      </span>
    }
    @if (!ballPickedUp()[0]) {
      <span>
        ({{totalStrokes()[0]}})
      </span>
    }
  </th>
  @if (rounds().length > 1) {
    <th id="p2str">{{rounds()[1].player.nick}}
      @if (ballPickedUp()[1]) {
        <span>
          (x)
        </span>
      }
      @if (!ballPickedUp()[1]) {
        <span>
          ({{totalStrokes()[1]}})
        </span>
      }
    </th>
  }
  @if (rounds().length > 2) {
    <th id="p3str">{{rounds()[2].player.nick}}
      @if (ballPickedUp()[2]) {
        <span>
          (x)
        </span>
      }
      @if (!ballPickedUp()[2]) {
        <span>
          ({{totalStrokes()[2]}})
        </span>
      }
    </th>
  }
  @if (rounds().length > 3) {
    <th id="p4str">{{rounds()[3].player.nick}}
      @if (ballPickedUp()[3]) {
        <span>
          (x)
        </span>
      }
      @if (!ballPickedUp()[3]) {
        <span>
          ({{totalStrokes()[3]}})
        </span>
      }
    </th>
  }
</ng-template>
`,
    imports: [NgTemplateOutlet, NgClass, RangePipe]
})
export class CommonScorecardComponent implements OnInit {

  curHoleIdx = input.required<number>();
  curHoleStrokes = input.required<number[]>();
  curHolePutts = input.required<number[]>();
  curHolePenalties = input.required<number[]>();
  rounds = input.required<OnlineRound[]>();
  ballPickedUp = input.required<boolean>();
  totalStrokes = input.required<number[]>();

  @Input() public calculateStyle: (i: number) => string;

  ngOnInit() {
     // This is intentional
  }
}
