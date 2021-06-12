import { Component, OnInit } from '@angular/core';
import { Round } from '@/_models';
import { HttpService, AuthenticationService, AlertService } from '@/_services';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-rounds',
  templateUrl: './rounds.component.html'
})
export class RoundsComponent implements OnInit {

  selectedTab: number;

  rounds: Array<Round>;
  savedRounds: Array<Round>;

  dispMy: boolean;
  dispRecent: boolean;
  page: number;
  savedPage: number;
  pageSize: number;
  // savedPageSize: number;

  constructor(private httpService: HttpService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private alertService: AlertService) {
  }

  ngOnInit(): void {

    if (this.authenticationService.currentPlayerValue === null) {
      this.authenticationService.logout();
      this.router.navigate(['/login']);
    } else {

      // initialize the current page
      this.page = 0;
      this.savedPage = 0;
      this.pageSize = 5;
      this.selectedTab = 0;
      this.dispMy = false;
      this.dispRecent = false;

      if (this.rounds === undefined) {
        this.getMyRounds();
      }
    }
  }

  onNext() {
    if (this.rounds.length === this.pageSize) {
      this.page++;
      this.selectedTab === 0 ? this.getMyRounds() : this.getRecentRounds();
    }
  }

  onPrevious() {
    if (this.page > 0) {
      this.page--;
      this.selectedTab === 0 ? this.getMyRounds() : this.getRecentRounds();
    }
  }

  private getMyRounds(): void {
    this.dispMy = false;
    this.httpService.getRounds(this.authenticationService.currentPlayerValue.id, this.page).pipe(
      tap(
        r => {
          this.rounds = r;
          this.dispMy = true;
        })
    ).subscribe();
  }

  private getRecentRounds(): void {
    this.dispRecent = false;
    this.httpService.getRecentRounds(this.page).pipe(
      tap(
        r => {
          this.rounds = r;
          this.dispRecent = true;
        })
    ).subscribe();
  }

  onTabClick(id: number) {
    this.alertService.clear();
    this.selectedTab = id;

    const tempRounds = this.rounds;
    this.rounds = this.savedRounds;
    this.savedRounds = tempRounds;

    const tempPage = this.page;
    this.page = this.savedPage;
    this.savedPage = tempPage;

    if (this.selectedTab === 1 && this.rounds === undefined) {
      this.getRecentRounds();
    }

  }
}

