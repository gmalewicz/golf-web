import { Hole } from './hole';

export interface Course {
  id?: number;
  name: string;
  par: number;
  holes?: Hole[];
}
