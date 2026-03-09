import { Course } from '@/_models/course';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';

@Injectable()
export class NavigationService {

  private courseSgn = signal<Course>(undefined);
  private onlineRoundsSgn = signal<OnlineRound[]>([]);
  private ownerSgn = signal<number>(undefined);
  private viewTypeSgn = signal<ViewType>(undefined);

  constructor() {
    this.getCourseSgn();
    this.getOnlineRoundsSgn();
    this.getOwnerSgn(); 
    this.getViewTypeSgn();   
  }


  setViewTypeSgn(viewTypeSgn: WritableSignal<ViewType>) {
    localStorage.setItem('viewType', JSON.stringify(viewTypeSgn()));
    this.viewTypeSgn = viewTypeSgn;
  }

  getViewTypeSgn(): WritableSignal<ViewType> {

    if (this.viewTypeSgn() === undefined && localStorage.getItem('viewType') !== null) {
      this.viewTypeSgn.set((JSON.parse(localStorage.getItem('viewType'))));
    }   
    return this.viewTypeSgn;

  }

  setOwnerSgn(ownerSgn: WritableSignal<number>) {
    localStorage.setItem('owner', JSON.stringify(ownerSgn()));
    this.ownerSgn = ownerSgn;
  }

  getOwnerSgn(): WritableSignal<number> {

    if (this.ownerSgn() === undefined && localStorage.getItem('owner') !== null) {
      this.ownerSgn.set((JSON.parse(localStorage.getItem('owner'))));
    }   
    return this.ownerSgn;
    
  }


  setCourseSgn(courseSgn: WritableSignal<Course>) {
    localStorage.setItem('course', JSON.stringify(courseSgn()));
    this.courseSgn = courseSgn;
  }

  getCourseSgn(): WritableSignal<Course> {

    if (this.courseSgn() === undefined && localStorage.getItem('course') !== null) {
      this.courseSgn.set((JSON.parse(localStorage.getItem('course'))));
    }   
    return this.courseSgn;
   
  }

  setOnlineRoundsSgn(onlineRoundsSgn: WritableSignal<OnlineRound[]>) {
    localStorage.setItem('onlineRounds', JSON.stringify(onlineRoundsSgn()));
    this.onlineRoundsSgn = onlineRoundsSgn;
  }

  getOnlineRoundsSgn(): WritableSignal<OnlineRound[]> {
    if (this.onlineRoundsSgn().length === 0 && localStorage.getItem('onlineRounds') !== null) {
      this.onlineRoundsSgn.set((JSON.parse(localStorage.getItem('onlineRounds'))));
    }   
    return this.onlineRoundsSgn;
  }

  clear() {
    this.courseSgn.set(undefined);
    this.onlineRoundsSgn.set([]);
    this.ownerSgn.set(undefined);
    this.viewTypeSgn.set(undefined);
    localStorage.removeItem('course');
    localStorage.removeItem('onlineRounds');
    localStorage.removeItem('owner');
    localStorage.removeItem('viewType');
  }
}

export const ViewType = {
  COURSE: 0,
  PLAYER: 1,
  MP: 2,
  FBMP: 3
};

export type ViewType = (typeof ViewType)[keyof typeof ViewType]; 


