import { Course, Hole, teeTypes } from '@/_models';

export function calculateCourseHCP(teeType: number,
                                   playerWHS: number,
                                   sr: number,
                                   cr: number,
                                   par: number): number {

  let courseHCP = 0;

  if (teeType === teeTypes.TEE_TYPE_18) {
    courseHCP = Math.round(playerWHS * sr / 113 + cr - par);
  } else {
    courseHCP = Math.round((playerWHS / 2) * sr / 113 + cr - par);
  }

  // console.log('course hcp: ' + courseHCP);

  return courseHCP;
}

/*
export function getFirst9Par(holes: Hole[]): number {

  return holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });

}
*/

export function getPlayedCoursePar(holes: Hole[], teeType: number, coursePar: number): number {

  let par = 0;
  switch (teeType) {
    case teeTypes.TEE_TYPE_FIRST_9: {
      par = holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
      break;
    }
    case teeTypes.TEE_TYPE_LAST_9: {
      par = holes.map(h => h.par).reduce((p, n, i) => { if (i < 9) { return p + n; } else { return p; } });
      break;
    }
    default: {
      par = coursePar;
      break;
    }
  }
  return par;
}



export function calculateHoleHCP(index: number,
                                 teeType: number,
                                 courseHCP: number,
                                 holeHCP: number[][],
                                 course: Course) {

  let hcpAll: number;
  let hcpIncMaxHole: number;
  // calculate hole hcp for player and save it in score card
  if (teeType === teeTypes.TEE_TYPE_18) {
    hcpAll = Math.floor(courseHCP / 18);
    hcpIncMaxHole = courseHCP - (hcpAll * 18);
  } else {
    hcpAll = Math.floor(courseHCP / 9);
    hcpIncMaxHole = courseHCP - (hcpAll * 9);
  }

  switch (teeType) {

    case teeTypes.TEE_TYPE_18: {

      holeHCP[index].fill(hcpAll);

      holeHCP[index].forEach((hcp, i) => {
        if (hcpIncMaxHole > 0 && course.holes[i].si <= (hcpIncMaxHole - 1)) {
          // if some holes needs hcp update increase them
          holeHCP[index][i] += 1;
        }
      });
      break;
    }

    case teeTypes.TEE_TYPE_FIRST_9: {

      holeHCP[index].fill(hcpAll, 0, 9);

      const holesUpd: Hole[] = course.holes.slice(0, 9).sort((a, b) => a.si - b.si);

      const maxHoleSiForUpd: number = holesUpd[hcpIncMaxHole - 1].si;

      holeHCP[index].forEach((s, i) => {

        if (i < 9 && course.holes[i].si <= maxHoleSiForUpd) {
          holeHCP[index][i]++;
        }
      });
      break;
    }

    case teeTypes.TEE_TYPE_LAST_9: {

      holeHCP[index].fill(hcpAll, 9, 18);

      const holesUpd: Hole[] = course.holes.slice(9, 18).sort((a, b) => a.si - b.si);

      const maxHoleSiForUpd: number = holesUpd[hcpIncMaxHole - 1].si;

      holeHCP[index].forEach((s, i) => {

        if (i >= 9 && course.holes[i].si <= maxHoleSiForUpd) {
          holeHCP[index][i]++;
        }

      });
      break;
    }
  }
}
