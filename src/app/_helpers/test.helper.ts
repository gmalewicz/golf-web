import { OnlineRound } from '@/scorecard/_models';
import { Course } from '@/_models/course';
import { Round } from '@/_models/round';
import { Tee, teeTypes } from '@/_models/tee';
import { AuthenticationService } from '@/_services/authentication.service';
import { of } from 'rxjs';

export function getTestRound(): Round {

  return {
    course: {
      id: 1, name: 'Lisia Polana', par: 72, holes: [
      { par: 4, number: 1, si: 1 },
      { par: 4, number: 2, si: 2 },
      { par: 4, number: 3, si: 3 },
      { par: 4, number: 4, si: 4 },
      { par: 4, number: 5, si: 5 },
      { par: 4, number: 6, si: 6 },
      { par: 4, number: 7, si: 7 },
      { par: 4, number: 8, si: 8 },
      { par: 4, number: 9, si: 9 },
      { par: 4, number: 10, si: 10 },
      { par: 4, number: 11, si: 11 },
      { par: 4, number: 12, si: 12 },
      { par: 4, number: 13, si: 13 },
      { par: 4, number: 14, si: 14 },
      { par: 4, number: 15, si: 15 },
      { par: 4, number: 16, si: 16 },
      { par: 4, number: 17, si: 17 },
      { par: 4, number: 18, si: 18 }]
    }, roundDate: '10/10/2020', matchPlay: false, mpFormat: 0.75, id: 1,
     player: [{id: 1, nick: 'test', roundDetails: {whs: 10, cr: 68, sr: 133, teeId: 0, teeType: teeTypes.TEE_TYPE_18}},
              {id: 2, nick: 'test2', roundDetails: {whs: 10, cr: 68, sr: 133, teeId: 0, teeType: teeTypes.TEE_TYPE_18}}],
    scoreCard: [{ hole: 1, stroke: 10, pats: 0 },
    { hole: 2, stroke: 1, pats: 0 },
    { hole: 3, stroke: 1, pats: 0 },
    { hole: 4, stroke: 1, pats: 0 },
    { hole: 5, stroke: 1, pats: 0 },
    { hole: 6, stroke: 1, pats: 0 },
    { hole: 7, stroke: 1, pats: 0 },
    { hole: 8, stroke: 1, pats: 0 },
    { hole: 9, stroke: 1, pats: 0 },
    { hole: 10, stroke: 1, pats: 0 },
    { hole: 11, stroke: 1, pats: 0 },
    { hole: 12, stroke: 1, pats: 0 },
    { hole: 13, stroke: 1, pats: 0 },
    { hole: 14, stroke: 1, pats: 0 },
    { hole: 15, stroke: 1, pats: 0 },
    { hole: 16, stroke: 1, pats: 0 },
    { hole: 17, stroke: 1, pats: 0 },
    { hole: 18, stroke: 1, pats: 0 },
    {hole: 1, stroke: 2, pats: 0},
    {hole: 2, stroke: 20, pats: 0},
    {hole: 3, stroke: 2, pats: 0},
    {hole: 4, stroke: 2, pats: 0},
    {hole: 5, stroke: 2, pats: 0},
    {hole: 6, stroke: 2, pats: 0},
    {hole: 7, stroke: 2, pats: 0},
    {hole: 8, stroke: 2, pats: 0},
    {hole: 9, stroke: 2, pats: 0},
    {hole: 10, stroke: 2, pats: 0},
    {hole: 11, stroke: 2, pats: 0},
    {hole: 12, stroke: 2, pats: 0},
    {hole: 13, stroke: 2, pats: 0},
    {hole: 14, stroke: 2, pats: 0},
    {hole: 15, stroke: 2, pats: 0},
    {hole: 16, stroke: 2, pats: 0},
    {hole: 17, stroke: 2, pats: 0},
    {hole: 18, stroke: 2, pats: 0}]
  };
}

export function getTestCourse(): Course {

  return getTestRound().course;
}

export function getTee(): Tee {

  return {id: 1, cr: 68, sr: 133, tee: 'test', teeType: teeTypes.TEE_TYPE_18, sex: false};
}

export let authenticationServiceStub: Partial<AuthenticationService>;

authenticationServiceStub = {
  currentPlayerValue: {nick: 'test', id: 1, whs: 10},
  playerRole: 'PLAYER',
  logout(): void {
    // This is intentional
  }
};

export class MatDialogMock {

    open() {
        return {
            afterClosed: () => of({ name: 'some object' }),
            componentInstance: {confirmMessage: ''}
        };
    }
}

export class WebSocketAPIMock {

  constructor(appComponent: any = null,
              private alertService: any = null,
              private authenticationService: any = null,
              acceptMessage: boolean = false,
              reconnect: boolean = false) {
      // This is intentional
    }



  _connect(listen: boolean) {
    // This is intentional
  }
  _disconnect() {
    // This is intentional
  }

}

export function getTestOnlineRound(): OnlineRound[] {

  return [{
    finalized: false,
    putts: false,
    penalties: false,
    matchPlay: true,
    course: {id: 5, name: null, par: null, holeNbr: null},
    player: {id: 1, nick: 'Greg', sex: false, whs: 28.5},
    tee: {id: 5, tee: 'yellow', cr: 70.5, sr: 129, teeType: 0, sex: false},
    teeTime: '12:46',
    nick2: 'Gosia',
    id: 164,
    owner: 1,
  },
  {
    course: {id: 6, name: null, par: null, holeNbr: null},
    finalized: false,
    id: 165,
    matchPlay: true,
    nick2: 'Gosia',
    owner: 1,
    penalties: false,
    player: {id: 11, nick: 'Gosia', sex: true, whs: 34.3},
    putts: false,
    tee: {id: 6, tee: 'red', cr: 70.2, sr: 129, teeType: 0, sex: true},
    teeTime: '12:46'
  }
];

}
