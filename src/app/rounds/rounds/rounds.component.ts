
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

    if (this.roundsNavigationService.getRounds() === undefined) {
      this.getMyRounds();
    } else {
      this.dispRounds = true;
    }
  }

  ngOnDestroy(): void {
    this.roundsNavigationService.clear();
  }

  onNext() {
    if (this.roundsNavigationService.getRounds().length === this.roundsNavigationService.getPageSize()) {
      this.roundsNavigationService.increasePage();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.roundsNavigationService.getSelectedTab() === 0 ? this.getMyRounds() : this.getRecentRounds();
    }
  }

  onPrevious() {
    if (this.roundsNavigationService.getPage() > 0) {
      this.roundsNavigationService.decreasePage();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      this.roundsNavigationService.getSelectedTab() === 0 ? this.getMyRounds() : this.getRecentRounds();
    }
  }

  private getMyRounds(): void {
    this.dispRounds = false;
    this.httpService.getRounds(this.authenticationService.currentPlayerValue.id, this.roundsNavigationService.getPage()).pipe(
      tap(
        r => {
          this.roundsNavigationService.setRounds(r);
          this.dispRounds = true;
        })
    ).subscribe();
  }

  private getRecentRounds(): void {
    this.dispRounds = false;
    this.httpService.getRecentRounds(this.roundsNavigationService.getPage()).pipe(
      tap(
        r => {
          this.roundsNavigationService.setRounds(r);
          this.dispRounds = true;
        })
    ).subscribe();
  }

  onTabClick(id: number) {

    this.roundsNavigationService.setSelectedTab(id);

    const tempRounds = this.roundsNavigationService.getRounds();
    this.roundsNavigationService.setRounds(this.savedRounds);
    this.savedRounds = tempRounds;

    const tempPage = this.roundsNavigationService.getPage();
    this.roundsNavigationService.setPage(this.savedPage);
    this.savedPage = tempPage;

    if (this.roundsNavigationService.getSelectedTab() === 1 && this.roundsNavigationService.getRounds() === undefined) {
      this.getRecentRounds();
    } else if (this.roundsNavigationService.getSelectedTab() === 0 && this.roundsNavigationService.getRounds() === undefined) {
      this.getMyRounds();
    }
  }
}

