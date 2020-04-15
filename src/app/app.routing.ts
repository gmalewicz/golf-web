import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './courses/courses.component';
import { RoundsComponent } from './rounds/rounds.component';
import { AddCourseComponent } from './add-course/add-course.component';
import { CourseComponent } from './course/course.component';
import { RoundComponent } from './round/round.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '@/_helpers';
import { RegistrationComponent } from './registration/registration.component';
import { UpdatePlayerComponent } from './update-player/update-player.component';
import { GamesComponent } from './games/games.component';
import { HoleStakeSetupComponent } from './hole-stake-setup/hole-stake-setup.component';
import { HoleStakeGameComponent } from './hole-stake-game/hole-stake-game.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  // navigation main manu in navigation component or during round adding
  { path: 'courses/:parent', component: CoursesComponent, canActivate: [AuthGuard] },
  { path: 'rounds', component: RoundsComponent, canActivate: [AuthGuard] },
  { path: 'addCourse', component: AddCourseComponent, canActivate: [AuthGuard] },
  { path: 'course/:id/:courseName', component: CourseComponent, canActivate: [AuthGuard] },
  { path: 'round', component: RoundComponent, canActivate: [AuthGuard] },
  { path: 'addScorecard/:courseId/:courseName', component: AddScorecardComponent, canActivate: [AuthGuard] },
  { path: 'updatePlayer', component: UpdatePlayerComponent, canActivate: [AuthGuard] },
  { path: 'games', component: GamesComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeSetup', component: HoleStakeSetupComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeGame/:players/:stake', component: HoleStakeGameComponent, canActivate: [AuthGuard] },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent }
];

export const appRoutingModule = RouterModule.forRoot(routes);
