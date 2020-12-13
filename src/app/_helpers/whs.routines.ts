import { Hole, teeTypes } from '@/_models';

export function calculateCourseHCP(teeType: number,
                                   playerWHS: number,
                                   sr: number,
                                   cr: number,
                                   par: number): number {

  let courseHCP  = 0;

  if  (teeType === teeTypes.TEE_TYPE_18) {
    courseHCP = Math.round(playerWHS * sr / 113 + cr - par);
  } else {
    courseHCP = Math.round((playerWHS / 2) * sr / 113 + cr - par);
  }

  // console.log('course hcp: ' + courseHCP);

  return courseHCP;
}

export function getFirst9Par(holes: Hole[]): number {

    return holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });

}
