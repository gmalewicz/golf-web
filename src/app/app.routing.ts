import { RoleGuard } from './_helpers/role.guard';
import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '@/_helpers';
import { RegistrationComponent } from './registration/registration.component';
import { UpdatePlayerComponent } from './update-player/update-player.component';

import { RoundComponent } from './round/round/round.component';
import { RoundsComponent } from './rounds/rounds/rounds.component';
import { AdminComponent } from './admin/admin.component';

export const routing: Routes = [
  { path: '', component: HomeComponent },
  // navigation main manu in navigation component or during round adding
  { path: 'home', component: HomeComponent, canActivate: [() => inject(AuthGuard).canActivate()]},
  { path: 'courses', loadComponent: () => import('./courses/courses/courses.component').then(m => m.CoursesComponent), canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'rounds', component: RoundsComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'round', component: RoundComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'addScorecard/:courseId/:courseName/:coursePar', loadComponent: () => import('./add-scorecard/add-scorecard.component').then(m => m.AddScorecardComponent), canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'updatePlayer', component: UpdatePlayerComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'changeLog', loadComponent: () => import('./change-log/change-log.component').then(m => m.ChangeLogComponent), canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'admin', component: AdminComponent, canActivate: [() => inject(AuthGuard).canActivate(),
                                                            () => inject(RoleGuard).canActivate('ADMIN')]},


  { path: 'myScorecard', loadChildren: () => import('./scorecard/my-online-score-card/my-online-score-card.component').then((m) => m.myOnlineScoreCardRouts)},
  { path: 'scorecard', loadChildren: () => import('./scorecard/view-selector/view-selector.component').then((m) => m.onlineScoreCardRouts)},
  { path: 'course', loadChildren: () => import('./course/course/course.component').then((m) => m.courseRoutes) },
  { path: 'addCourse', loadChildren: () => import('./course/add-course/add-course.component').then((m) => m.addCourseRoutes)  },
  { path: 'tournaments', loadChildren: () => import('./tournament/tournaments/tournaments.component').then((m) => m.tournamentRoutes)},
  { path: 'cycles', loadChildren: () => import('./cycles/cycles/cycles.component').then((m) => m.cyclesRoutes)},
  { path: 'mpLeagues', loadChildren: () => import('./mp-league/mp-leagues/mp-leagues.component').then((m) => m.mpLeaguesRoutes)},

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent }
];



