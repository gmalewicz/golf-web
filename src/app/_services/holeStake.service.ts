import { HoleStake } from '@/_models';
import { Injectable } from '@angular/core';

@Injectable()
export class HoleStakeService {

  holeStake: HoleStake;

  public setHoleStake(holeStake: HoleStake) {
    this.holeStake = holeStake;
  }

  public getHoleStake(): HoleStake  {
    return this.holeStake;
  }
}
