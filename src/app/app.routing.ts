import { RoleGuard } from './_helpers/role.guard';
import { inject, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CoursesComponent } from './courses/courses/courses.component';
import { AddCourseComponent } from './add-course/add-course.component';
import { CourseComponent } from './course/course.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '@/_helpers';
import { RegistrationComponent } from './registration/registration.component';
import { UpdatePlayerComponent } from './update-player/update-player.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { AppModule } from './app.module';
import { RoundComponent } from './round/round/round.component';
import { RoundsComponent } from './rounds/rounds/rounds.component';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  // navigation main manu in navigation component or during round adding
  { path: 'home', component: HomeComponent, canActivate: [() => inject(AuthGuard).canActivate()]},
  { path: 'courses', component: CoursesComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'rounds', component: RoundsComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'addCourse', component: AddCourseComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'course', component: CourseComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'round', component: RoundComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'addScorecard/:courseId/:courseName/:coursePar', component: AddScorecardComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'updatePlayer', component: UpdatePlayerComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'changeLog', component: ChangeLogComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'admin', component: AdminComponent, canActivate: [() => inject(AuthGuard).canActivate(),
                                                            () => inject(RoleGuard).canActivate('ADMIN')]},

  { path: 'tournaments', loadChildren: () => import('./tournament/tournament.module').then(m => m.TournamentModule)},
  { path: 'scorecard', loadChildren: () => import('./scorecard/scorecard.module').then(m => m.ScorecardModule)},
  { path: 'cycles', loadChildren: () => import('./cycles/cycles.module').then(m => m.CyclesModule)},

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent }
];

export const routing: ModuleWithProviders<AppModule> = RouterModule.forRoot(routes, {});



