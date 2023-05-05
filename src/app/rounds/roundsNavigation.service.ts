import { Round } from '@/_models/round';
import { Injectable } from '@angular/core';

@Injectable()
export class RoundsNavigationService {

  page: number;
  selectedTab: number;
  rounds: Round[];

  lastPage: number;
  lastSelectedTab: number;
  lastRounds: Round[];

  static readonly PAGE_SIZE = 5;

  constructor() {
    this.clear();
  }

  clear() {
    this.lastPage = this.page;
    this.lastSelectedTab = this.selectedTab;
    this.lastRounds = this.rounds;
    this.page = 0;
    this.selectedTab = 0;
    this.rounds = undefined;
  }

  restoreLast() {
    this.page = this.lastPage;
    this.selectedTab = this.lastSelectedTab;
    this.rounds = this.lastRounds;
  }

  setPage(page: number) {
    this.page = page;
  }

  getPage(): number {
    return this.page;
  }

  increasePage() {
    this.page++;
  }

  decreasePage() {
    if (this.page > 0) {
      this.page--;
    }
  }

  setSelectedTab(selectedTab: number) {
    this.selectedTab = selectedTab;
  }

  getSelectedTab(): number {
    return this.selectedTab;
  }

  setRounds(rounds: Round[]) {
    this.rounds = rounds;
  }

  getRounds(): Round[] {
    return this.rounds;
  }

  getPageSize(): number {
    return RoundsNavigationService.PAGE_SIZE;
  }
}


