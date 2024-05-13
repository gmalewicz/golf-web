import { AuthenticationService } from '@/_services/authentication.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { OnlineRound } from '../_models/onlineRound';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
    selector: 'app-online-nav',
    templateUrl: './online-nav.component.html',
    standalone: true,
    imports: [NgIf, NgFor, NgClass]
})
export class OnlineNavComponent implements OnInit, OnDestroy {

  @Input() curHoleStrokes: number[];
  @Input() curPlayerIdx: number;
  @Input() puttSelectorActive: { active: boolean }[];
  @Input() rounds: OnlineRound[];
  @Input() curHolePutts: number[];
  @Input() curHolePenalties: number[];
  @Input() penaltySelectorActive: { active: boolean }[];
  @Input() public addScore: () => void;

  public buttons: number[];
  @Input() public inProgress: boolean;


  public isActive: boolean;
  subscriptions: Subscription[] = [];
  offlineEvent: Observable<Event>;
  onlineEvent: Observable<Event>;

  constructor(public authenticationService: AuthenticationService) {
    // This is intentional
  }

  ngOnInit(): void {
    this.buttons = [0, 1, 2, 3, 4, 5];
    this.handleAppConnectivityChanges();
    this.isActive = true;
  }

  ngOnDestroy(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onPickUp() {
    // 16 is agreed number of pick up hole
    this.curHoleStrokes[this.curPlayerIdx] = 16;
  }

  onDecrease() {
    // number of strokes canot be lower than 1
    if (this.curHoleStrokes[this.curPlayerIdx] === 0) {
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
    // clean up par, hole and si pressed buttons
    this.puttSelectorActive.fill({ active: false });
    this.puttSelectorActive[putts] = { active: true };
    this.curHolePutts[this.curPlayerIdx] = putts;
  }

  selectPenalty(penalties: number) {
    this.penaltySelectorActive.fill({ active: false });
    this.penaltySelectorActive[penalties] = { active: true };
    this.curHolePenalties[this.curPlayerIdx] = penalties;
  }

  private handleAppConnectivityChanges(): void {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(() => {
      // handle online mode
      this.isActive = true;
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(() => {
      // handle offline mode
        this.isActive = false;
    }));
  }
}
