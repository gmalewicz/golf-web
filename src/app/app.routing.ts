import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './courses/courses.component';
import { RoundsComponent } from './rounds/rounds.component';
import { AddCourseComponent } from './add-course/add-course.component';
import { CourseComponent } from './course/course.component';
import { RoundComponent } from './round/round.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  // navigation main manu in navigation component or durin round adding
  { path: 'courses/:parent', component: CoursesComponent },
  { path: 'rounds', component: RoundsComponent },
  { path: 'addCourse', component: AddCourseComponent },
  { path: 'course/:id/:courseName', component: CourseComponent },
  { path: 'round', component: RoundComponent },
  { path: 'addScorecard/:courseId/:courseName', component: AddScorecardComponent }
];

export const appRoutingModule = RouterModule.forRoot(routes);
