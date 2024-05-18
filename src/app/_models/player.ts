import { PlayerRoundDetails } from './playerRoundDetails';
export interface Player {
  id?: number;
  nick?: string;
  password?: string;
  //token?: string;
  whs?: number;
  captcha?: string;
  roundDetails?: PlayerRoundDetails;
  sex?: boolean;
  //refreshToken?: string;
  updateSocial?: boolean;
  action?: string;
  female?: boolean;
  email?: string;
  role?: number
}
