import { Player } from '@/_models/player';
import { Injectable } from '@angular/core';

export interface Cycle {
  id?: number;
  name: string;
  status: boolean;
  player?: Player;
  // 0 - all rounds are applicable
  // if not 0: number of best rounds from cycle to be included in the result
  bestRounds: number;
  maxWhs: number;
}

export const CycleStatus = {
  STATUS_OPEN: false,
  STATUS_CLOSE: true
};
