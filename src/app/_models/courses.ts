import { Course } from './course';

export interface Courses {
    favourites?: Course[];
    all?: Course[];
    searchRes?: Course[];
}
