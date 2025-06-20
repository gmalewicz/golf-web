
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Round } from '@/_models';
import { HttpService, AuthenticationService } from '@/_services';
import { tap } from 'rxjs/operators';
import { RoundsNavigationService } from '../roundsNavigation.service';
import { RouterLink } from '@angular/router';
import { ListRoundsComponent } from '../list-rounds/list-rounds.component';
import { NgClass } from '@angular/common';


@Component({
    selector: 'app-rounds',
    templateUrl: './rounds.component.html',
    imports: [NgClass, ListRoundsComponent, RouterLink]
})
export class RoundsComponent implements OnInit, OnDestroy {

  savedRounds: Array<Round>;
  dispRounds: boolean;
  savedPage: number;

  constructor(private readonly httpService: HttpService,
              private readonly authenticationService: AuthenticationService,
              public roundsNavigationService: RoundsNavigationService) {
  }

  ngOnInit(): void {

    this.savedPage = 0;
    this.dispRounds = false;

    if (this.roundsNavigationService.rounds() === undefined) {
      this.getMyRounds();
    } else {
      this.dispRounds = true;
    }
  }

  ngOnDestroy(): void {
    this.roundsNavigationService.clear();
  }

  onNext() {
    if (this.roundsNavigationService.rounds().length === this.roundsNavigationService.pageSize()) {
      this.roundsNavigationService.page.update(value => value++);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.roundsNavigationService.selectedTab() === 0 ? this.getMyRounds() : this.getRecentRounds();
    }
  }

  onPrevious() {
    if (this.roundsNavigationService.page() > 0) {
      this.roundsNavigationService.page.update(value => value > 0 ? value : value-- );
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.roundsNavigationService.selectedTab() === 0 ? this.getMyRounds() : this.getRecentRounds();
    }
  }

  private getMyRounds(): void {
    this.dispRounds = false;
    this.httpService.getRounds(this.authenticationService.currentPlayerValue.id, this.roundsNavigationService.page()).pipe(
      tap(
        r => {
          this.roundsNavigationService.rounds.set(r);
          this.dispRounds = true;
        })
    ).subscribe();
  }

  private getRecentRounds(): void {
    this.dispRounds = false;
    this.httpService.getRecentRounds(this.roundsNavigationService.page()).pipe(
      tap(
        r => {
          this.roundsNavigationService.rounds.set(r);
          this.dispRounds = true;
        })
    ).subscribe();
  }

  onTabClick(id: number) {

    this.roundsNavigationService.selectedTab.set(id);

    const tempRounds = this.roundsNavigationService.rounds();
    this.roundsNavigationService.rounds.set(this.savedRounds);
    this.savedRounds = tempRounds;

    const tempPage = this.roundsNavigationService.page();
    this.roundsNavigationService.page.set(this.savedPage);
    this.savedPage = tempPage;

    if (this.roundsNavigationService.selectedTab() === 1 && this.roundsNavigationService.rounds() === undefined) {
      this.getRecentRounds();
    } else if (this.roundsNavigationService.selectedTab() === 0 && this.roundsNavigationService.rounds() === undefined) {
      this.getMyRounds();
    }
  }
}

