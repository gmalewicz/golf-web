import { TeeTimeModification } from './../../_models/teeTimeModification';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TournamentNavigationService } from '@/tournament/_services';
import { AlertService } from '@/_services/alert.service';

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

  constructor(public navigationService: TournamentNavigationService,
              private readonly cd: ChangeDetectorRef,
              private readonly alertService: AlertService) {}

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

  async modifyFlight(idx: number) {

    // do nothing if the player is not selected
    // do nothing if both player are slected - just prevention
    if (this.teeTimeModification.firstToSwap == undefined || this.teeTimeModification.secondToSwap != undefined) {
      return;
    }

    // unselect player if the same flight is choosen
    if (this.navigationService.teeTimes()[idx].flight === this.navigationService.teeTimes()[this.teeTimeModification.firstToSwap].flight) {
      this.modBackCls[this.teeTimeModification.firstToSwap] = '';
      this.teeTimeModification = {};
      return;
    }

    //check if original player flight will have at least 2 players after modification
    if  (this.navigationService.teeTimes().filter(tt => tt.flight === this.navigationService.teeTimes()[this.teeTimeModification.firstToSwap].flight).length < 3) {
      this.alertService.error($localize`:@@modTeeTime-movTofewPlayes:At least 2 players have to stay in the flight`, false);
      this.modBackCls[this.teeTimeModification.firstToSwap] = '';
      this.teeTimeModification = {};
      return;
    }

    //check if target flight have no more than 3 players
    if  (this.navigationService.teeTimes().filter(tt => tt.flight === this.navigationService.teeTimes()[idx].flight).length > 3) {
      this.alertService.error($localize`:@@modTeeTime-movTofewPlayes:Target flight must have no more than 3 players`, false);
      this.modBackCls[this.teeTimeModification.firstToSwap] = '';
      this.teeTimeModification = {};
      return;
    }

    this.teeTimeModification.newFlight = idx;
    this.navigationService.teeTimes().forEach((tt, id) => {
      if (tt.flight === this.navigationService.teeTimes()[idx].flight) {
        this.modBackCls[id] = 'highlight';
      }
    });
    await this.delay(1000);
    this.navigationService.teeTimeParameters().teeTimes = this.navigationService.teeTimes();
    this.navigationService.modification = true;
    this.teeTimeModification.newFlight = this.navigationService.teeTimes()[idx].flight;
    this.navigationService.teeTimeModification.set(this.teeTimeModification);
    this.modBackCls = Array(this.navigationService.tournamentPlayers().length).fill('');
    this.teeTimeModification = {};
    this.cd.markForCheck();
  }

  delay(delay: number) {
    return new Promise(r => {
        setTimeout(r, delay);

    })
  }
}
