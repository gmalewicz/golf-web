import { Course } from '@/_models/course';
import { Injectable } from '@angular/core';
import { OnlineRound } from '../_models/onlineRound';

@Injectable()
export class NavigationService {

  course: Course;
  onlineRounds: OnlineRound[];
  owner: number;

  constructor() {
    this.getCourse();
    this.getOnlineRounds();
    this.getOwner();
  }

  setOwner(owner: number) {
    localStorage.setItem('owner', JSON.stringify(owner));
    this.owner = owner;
  }

  getOwner(): number {

    this.owner = this.owner ?? JSON.parse(localStorage.getItem('owner'));
    return this.owner;
  }


  setCourse(course: Course) {
    localStorage.setItem('course', JSON.stringify(course));
    this.course = course;
  }

  getCourse(): Course {
   
    this.course = this.course ?? JSON.parse(localStorage.getItem('course'));
    return this.course;
  }

  setOnlineRounds(onlineRounds: OnlineRound[]) {
    localStorage.setItem('onlineRounds', JSON.stringify(onlineRounds));
    this.onlineRounds = onlineRounds;
  }

  getOnlineRounds(): OnlineRound[] {
    
    this.onlineRounds =  this.onlineRounds ?? JSON.parse(localStorage.getItem('onlineRounds'));
    return this.onlineRounds;
  }

  clear() {
    this.course = undefined;
    this.onlineRounds = undefined;
    this.owner = undefined;
    localStorage.removeItem('course');
    localStorage.removeItem('onlineRounds');
    localStorage.removeItem('owner');
  }
}


