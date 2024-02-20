import { TeeTime } from "./teeTime";

export interface TeeTimeParameters {
  firstTeeTime: string;
  teeTimeStep: number;
  flightSize: number;
  teeTimes?: TeeTime[];
  published: boolean
}

export const TeeTimePublishStatus = {
  STATUS_NOT_PUBLISHED: false,
  STATUS_PUBLISHED: true
};

