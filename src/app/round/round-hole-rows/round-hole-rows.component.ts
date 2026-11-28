import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Round } from '@/_models/round';
import { RangePipe } from '../../_helpers/range';

const HALF = 9;

/**
 * Hole numbers header row of the round views.
 */
@Component({
  // attribute selector, the rows are rendered inside the tables of the round views
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tr[appRoundHoleHead]',
  template: `
    <th id="hole" i18n="@@roundViewMp-hole" class="center">Hole</th>
    @for (i of 9 | range; track i;) {
      <th id="no" class="w-5">
        {{i + 1}}
      </th>
    }
    <th id="out" class="center">OUT</th>
    @for (i of 9 | range; track i;) {
      <th id="no2" class="w-5">
        {{i + 10}}
      </th>
    }
    <th id="in" class="center">IN</th>
    <th id="total" class="center">TOTAL</th>
    @if (teamColumn()) {
      <th id="teamCol" class="center">Team</th>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RangePipe]
})
export class RoundHoleHeadComponent {

  teamColumn = input(false);
}

/**
 * Par row of the round views, with the sums of the first nine, last nine and all holes.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tr[appRoundParRow]',
  template: `
    <th id="par" class="center">PAR</th>
    @for (i of 9 | range; track i;) {
      <td class="center">
        {{round().course.holes?.[i]?.par}}
      </td>
    }
    <th id="firstPar" class="center">{{first9parSgn()}}</th>
    @for (i of 9 | range; track i;) {
      <td class="center">
        {{round().course.holes?.[i + 9]?.par}}
      </td>
    }
    <th id="lpar" class="center">{{last9parSgn()}}</th>
    <th id="ptotal" class="center">{{first9parSgn() + last9parSgn()}}</th>
    @if (teamColumn()) {
      <th id="pteam"></th>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RangePipe]
})
export class RoundParRowComponent {

  round = input.required<Round>();
  teamColumn = input(false);

  first9parSgn = computed(() => this.round().course.holes!.map(h => h.par).reduce((p, n, i) => (i < HALF ? p + n : p), 0));
  last9parSgn = computed(() => this.round().course.par - this.first9parSgn());
}

/**
 * Stroke index row of the round views.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tr[appRoundSiRow]',
  template: `
    <th id="si" class="center">SI</th>
    @for (i of 9 | range; track i;) {
      <td class="center">
        {{round().course.holes?.[i]?.si}}
      </td>
    }
    <th id="empty"></th>
    @for (i of 9 | range; track i;) {
      <td class="center">
        {{round().course.holes?.[i + 9]?.si}}
      </td>
    }
    <th id="empty2"></th>
    <th id="empty3"></th>
    @if (teamColumn()) {
      <th id="empty5"></th>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RangePipe]
})
export class RoundSiRowComponent {

  round = input.required<Round>();
  teamColumn = input(false);
}
