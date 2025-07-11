import { AuthenticationService } from '@/_services/authentication.service';
import { Component, Input, OnDestroy, OnInit, Signal, input, signal } from '@angular/core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { OnlineRound } from '../_models/onlineRound';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-online-nav',
    templateUrl: './online-nav.component.html',
    imports: [NgClass]
})
export class OnlineNavComponent implements OnInit, OnDestroy {

  curHoleStrokes = input.required<number[]>();
  curPlayerIdx = input.required<number>();
  puttSelectorActive = input.required<{active: boolean}[]>();
  curHolePutts = input.required<number[]>();
  curHolePenalties = input.required<number[]>();
  penaltySelectorActive = input.required<{active: boolean}[]>();
  inProgress = input.required<boolean>();
  @Input() public addScore: () => void;
  @Input() public roundsSgn: Signal<OnlineRound[]>;

  public buttonsSgn = signal<number[]>([]);
  public isActiveSgn = signal<boolean>(false);
  
  subscriptions: Subscription[] = [];
  offlineEvent: Observable<Event>;
  onlineEvent: Observable<Event>;

  constructor(public authenticationService: AuthenticationService) {
    // This is intentional
  }

  ngOnInit(): void {
    this.buttonsSgn.set([0, 1, 2, 3, 4, 5]);
    this.handleAppConnectivityChanges();
    this.isActiveSgn.set(true);
  }

  ngOnDestroy(): void {

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onPickUp() {
    // 16 is agreed number of pick up hole
    this.curHoleStrokes()[this.curPlayerIdx()] = 16;
  }

  onDecrease() {
    // number of strokes canot be lower than 1
    if (this.curHoleStrokes()[this.curPlayerIdx()] === 0) {
      return;
    }
    this.curHoleStrokes()[this.curPlayerIdx()]--;

  }

  onIncrease() {

    // number of strokes canot be greater than 15
    if (this.curHoleStrokes()[this.curPlayerIdx()] >= 15) {
      return;
    }
    this.curHoleStrokes()[this.curPlayerIdx()]++;
  }

  selectPutt(putts: number) {
    // clean up par, hole and si pressed buttons
    this.puttSelectorActive().fill({ active: false });
    this.puttSelectorActive()[putts] = { active: true };
    this.curHolePutts()[this.curPlayerIdx()] = putts;
  }

  selectPenalty(penalties: number) {
    this.penaltySelectorActive().fill({ active: false });
    this.penaltySelectorActive()[penalties] = { active: true };
    this.curHolePenalties()[this.curPlayerIdx()] = penalties;
  }

  private handleAppConnectivityChanges(): void {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(() => {
      // handle online mode
      this.isActiveSgn.set(true);
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(() => {
      // handle offline mode
        this.isActiveSgn.set(false);
    }));
  }
}
