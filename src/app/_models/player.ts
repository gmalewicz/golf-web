import { PlayerRoundDetails } from './playerRoundDetails';
export interface Player {
  id?: number;
  nick?: string;
  password?: string;
  token?: string;
  whs?: number;
  captcha?: string;
  role?: number;
  roundDetails?: PlayerRoundDetails;
  sex?: boolean;
  refreshToken?: string;
}
