import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Cycle } from '../_models/cycle';
import { CycleResult } from '../_models/cycleResult';
import { CycleTournament } from '../_models/cycleTournament';
import { RangePipe } from '../../_helpers/range';

@Component({
  selector: 'app-cycle-results-table',
  templateUrl: './cycle-results-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RangePipe]
})
export class CycleResultsTableComponent {
  cycle = input.required<Cycle>();
  results = input.required<CycleResult[]>();
  cycleTournaments = input.required<CycleTournament[]>();
  rounds = input.required<number[]>();
  names = input.required<number[]>();
}
