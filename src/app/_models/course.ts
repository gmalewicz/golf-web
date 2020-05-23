import { Hole } from './hole';
import { Tee } from '.';

export interface Course {
  id?: number;
  name: string;
  par: number;
  holes?: Hole[];
  tees?: Tee[];
}
