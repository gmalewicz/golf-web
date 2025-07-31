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

  curHoleStrokesSgn = input.required<number[]>();
  curPlayerIdxSgn = input.required<number>();
  puttSelectorActiveSgn = input.required<{active: boolean}[]>();
  curHolePuttsSgn = input.required<number[]>();
  curHolePenaltiesSgn = input.required<number[]>();
  penaltySelectorActiveSgn = input.required<{active: boolean}[]>();
  inProgressSgn = input.required<boolean>();
  @Input() public addScore: () => void;
  roundsSgn = input.required<OnlineRound[]>();

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
    this.curHoleStrokesSgn()[this.curPlayerIdxSgn()] = 16;
  }

  onDecrease() {
    // number of strokes canot be lower than 1
    if (this.curHoleStrokesSgn()[this.curPlayerIdxSgn()] === 0) {
      return;
    }
    this.curHoleStrokesSgn()[this.curPlayerIdxSgn()]--;

  }

  onIncrease() {

    // number of strokes canot be greater than 15
    if (this.curHoleStrokesSgn()[this.curPlayerIdxSgn()] >= 15) {
      return;
    }
    this.curHoleStrokesSgn()[this.curPlayerIdxSgn()]++;
  }

  selectPutt(putts: number) {
    // clean up par, hole and si pressed buttons
    this.puttSelectorActiveSgn().fill({ active: false });
    this.puttSelectorActiveSgn()[putts] = { active: true };
    this.curHolePuttsSgn()[this.curPlayerIdxSgn()] = putts;
  }

  selectPenalty(penalties: number) {
    this.penaltySelectorActiveSgn().fill({ active: false });
    this.penaltySelectorActiveSgn()[penalties] = { active: true };
    this.curHolePenaltiesSgn()[this.curPlayerIdxSgn()] = penalties;
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
