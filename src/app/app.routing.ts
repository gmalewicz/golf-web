import { RoleGuard } from './_helpers/role.guard';
import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './courses/courses/courses.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '@/_helpers';
import { RegistrationComponent } from './registration/registration.component';
import { UpdatePlayerComponent } from './update-player/update-player.component';
import { ChangeLogComponent } from './change-log/change-log.component';

import { RoundComponent } from './round/round/round.component';
import { RoundsComponent } from './rounds/rounds/rounds.component';
import { AdminComponent } from './admin/admin.component';

export const routing: Routes = [
  { path: '', component: HomeComponent },
  // navigation main manu in navigation component or during round adding
  { path: 'home', component: HomeComponent, canActivate: [() => inject(AuthGuard).canActivate()]},
  { path: 'courses', component: CoursesComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'rounds', component: RoundsComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'round', component: RoundComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'addScorecard/:courseId/:courseName/:coursePar', component: AddScorecardComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'updatePlayer', component: UpdatePlayerComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'changeLog', component: ChangeLogComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'admin', component: AdminComponent, canActivate: [() => inject(AuthGuard).canActivate(),
                                                            () => inject(RoleGuard).canActivate('ADMIN')]},

  { path: 'scorecard', loadChildren: () => import('./scorecard/online-score-card/online-score-card.component').then((m) => m.onlineScoreCardRouts)},
  { path: 'course', loadChildren: () => import('./course/course/course.component').then((m) => m.courseRoutes) },
  { path: 'addCourse', loadChildren: () => import('./course/add-course/add-course.component').then((m) => m.addCourseRoutes)  },
  { path: 'tournaments', loadChildren: () => import('./tournament/tournaments/tournaments.component').then((m) => m.tournamentRoutes)},
  { path: 'cycles', loadChildren: () => import('./cycles/cycles/cycles.component').then((m) => m.cyclesRoutes)},
  { path: 'mpLeagues', loadChildren: () => import('./mp-league/mp-leagues/mp-leagues.component').then((m) => m.mpLeaguesRoutes)},

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent }
];



