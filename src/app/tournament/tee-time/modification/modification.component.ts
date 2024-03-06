import { TeeTimeModification } from './../../_models/teeTimeModification';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentNavigationService } from '@/tournament/_services';

@Component({
  selector: 'app-modification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModificationComponent implements OnInit {

  private teeTimeModification: TeeTimeModification = {};

  public modBackCls: string[] = Array(this.navigationService.tournamentPlayers().length).fill('');

  constructor(public navigationService: TournamentNavigationService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    // this is intentional
  }


  async modifyPlayer(idx: number) {

    if (this.teeTimeModification.firstToSwap == undefined) {
      this.modBackCls[idx] = 'golf-background-red';
      this.teeTimeModification.firstToSwap = idx;
    } else {
      this.teeTimeModification.secondToSwap = idx;
      this.modBackCls[idx] = 'highlight';
      await this.delay(1000);
      this.navigationService.teeTimeParameters().teeTimes = this.navigationService.teeTimes();
      this.navigationService.modification = true;
      this.navigationService.teeTimeModification.set(this.teeTimeModification);
      this.modBackCls[this.teeTimeModification.firstToSwap] = '';
      this.modBackCls[this.teeTimeModification.secondToSwap] = '';
      this.teeTimeModification = {};
      this.cd.markForCheck();
    }
  }

  delay(delay: number) {
    return new Promise(r => {
        setTimeout(r, delay);

    })
  }
}
