import { TeeTime } from "./teeTime";

export interface TeeTimeParameters {
  firstTeeTime: string;
  teeTimeStep: number;
  flightSize: number;
  teeTimes?: TeeTime[];
  published: boolean;
  flightAssignment?: number;
}

export const TeeTimePublishStatus = {
  STATUS_NOT_PUBLISHED: false,
  STATUS_PUBLISHED: true
};

export const FlightAssignmentMode = {
  MODE_RANDOM: 1,
  MODE_HCP: 2,
  MODE_RESULTS: 3
};
