import { Round } from '@/_models/round';
import { Injectable, signal } from '@angular/core';

@Injectable()
export class RoundsNavigationService {

  public page = signal<number>(0);
  public selectedTab = signal<number>(0); 
  public rounds = signal<Round[]>(undefined);
  public lastRounds = signal<Round[]>(undefined);
 
  lastPage: number;
  lastSelectedTab: number;

  public pageSize = signal<number>(5).asReadonly();

  constructor() {
    this.clear();
  }

  clear() {
    this.lastPage = this.page();
    this.lastSelectedTab = this.selectedTab();
    this.lastRounds.set(this.rounds());
    this.page.set(0);
    this.selectedTab.set(0);
    this.rounds.set(undefined);
  }

  restoreLast() {
    this.page.set(this.lastPage);
    this.selectedTab.set(this.lastSelectedTab);
    this.rounds.set(this.lastRounds());
  }
}


