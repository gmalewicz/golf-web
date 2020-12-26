import { ModuleWithProviders } from '@angular/core';
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
import { ChangeLogComponent } from './change-log/change-log.component';
import { AppModule } from './app.module';

const routes: Routes = [
  { path: '', component: HomeComponent },
  // navigation main manu in navigation component or during round adding
  { path: 'courses', component: CoursesComponent, canActivate: [AuthGuard] },
  { path: 'rounds', component: RoundsComponent, canActivate: [AuthGuard] },
  { path: 'addCourse', component: AddCourseComponent, canActivate: [AuthGuard] },
  { path: 'course', component: CourseComponent, canActivate: [AuthGuard] },
  { path: 'round', component: RoundComponent, canActivate: [AuthGuard] },
  { path: 'addScorecard/:courseId/:courseName/:coursePar', component: AddScorecardComponent, canActivate: [AuthGuard] },
  { path: 'updatePlayer', component: UpdatePlayerComponent, canActivate: [AuthGuard] },
  { path: 'changeLog', component: ChangeLogComponent, canActivate: [AuthGuard] },

  { path: 'tournaments', loadChildren: () => import('./tournament/tournament.module').then(m => m.TournamentModule)},
  { path: 'scorecard', loadChildren: () => import('./scorecard/scorecard.module').then(m => m.ScorecardModule)},
  { path: 'games', loadChildren: () => import('./games/games.module').then(m => m.GamesModule)},

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent }
];

export const routing: ModuleWithProviders<AppModule> = RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' });



