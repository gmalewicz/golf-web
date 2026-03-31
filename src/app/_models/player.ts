import { PlayerRoundDetails } from './playerRoundDetails';
export interface Player {
  id?: number;
  nick?: string;
  password?: string;
  whs?: number;
  captcha?: string;
  roundDetails?: PlayerRoundDetails;
  sex?: boolean;
  updateSocial?: boolean;
  action?: string;
  female?: boolean;
  email?: string;
  role?: number
}
