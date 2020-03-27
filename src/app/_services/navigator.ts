import { BehaviorSubject, Observable } from 'rxjs';
import { Course, Round } from '@/_models';

export class NavigatorService {

  private round: Round;

  public setRound(round: Round): void {
    console.log('set round: ' + round);
    this.round = round;
  }

  public getRound(): Round {
    console.log('get round: ' + this.round);
    return this.round;
  }

  constructor() {}

}
