export interface Player {
  id?: number;
  nick: string;
  password?: string;
  token?: string;
  whs: number;
  captcha?: string;
  role?: number;
}
