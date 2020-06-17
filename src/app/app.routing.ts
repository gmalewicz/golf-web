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
import { HoleStakeRulesComponent } from './hole-stake-rules/hole-stake-rules.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { BbbGameRulesComponent } from './bbb-game-rules/bbb-game-rules.component';
import { BbbGameSetupComponent } from './bbb-game-setup/bbb-game-setup.component';
import { BbbGameComponent } from './bbb-game/bbb-game.component';
import { LastGamesComponent } from './last-games/last-games.component';
import { LastGamesDetailsComponent } from './last-games-details/last-games-details.component';
import { RoundViewWHSComponent } from './round-view-whs/round-view-whs.component';
import { TournamentsComponent } from './tournaments/tournaments.component';
import { TournamentResultsComponent } from './tournament-results/tournament-results.component';
import { TournamentRoundsComponent } from './tournament-rounds/tournament-rounds.component';
import { AddTournamentComponent } from './add-tournament/add-tournament.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  // navigation main manu in navigation component or during round adding
  { path: 'courses/:parent', component: CoursesComponent, canActivate: [AuthGuard] },
  { path: 'rounds', component: RoundsComponent, canActivate: [AuthGuard] },
  { path: 'addCourse', component: AddCourseComponent, canActivate: [AuthGuard] },
  { path: 'course', component: CourseComponent, canActivate: [AuthGuard] },
  { path: 'round', component: RoundComponent, canActivate: [AuthGuard] },
  { path: 'addScorecard/:courseId/:courseName/:coursePar', component: AddScorecardComponent, canActivate: [AuthGuard] },
  { path: 'updatePlayer', component: UpdatePlayerComponent, canActivate: [AuthGuard] },
  { path: 'games', component: GamesComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeSetup', component: HoleStakeSetupComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeRules', component: HoleStakeRulesComponent, canActivate: [AuthGuard] },
  { path: 'holeStakeGame', component: HoleStakeGameComponent, canActivate: [AuthGuard] },
  { path: 'bbbRules', component: BbbGameRulesComponent, canActivate: [AuthGuard] },
  { path: 'bbbSetup', component: BbbGameSetupComponent, canActivate: [AuthGuard] },
  { path: 'bbbGame', component: BbbGameComponent, canActivate: [AuthGuard] },
  { path: 'changeLog', component: ChangeLogComponent, canActivate: [AuthGuard] },
  { path: 'lastGames', component: LastGamesComponent, canActivate: [AuthGuard] },
  { path: 'lastGamesDetails', component: LastGamesDetailsComponent, canActivate: [AuthGuard] },
  { path: 'roundViewWHS', component: RoundViewWHSComponent, canActivate: [AuthGuard] },
  { path: 'tournaments', component: TournamentsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentResults', component: TournamentResultsComponent, canActivate: [AuthGuard] },
  { path: 'tournamentRounds', component: TournamentRoundsComponent, canActivate: [AuthGuard] },
  { path: 'addTournament', component: AddTournamentComponent, canActivate: [AuthGuard] },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent }
];

export const appRoutingModule = RouterModule.forRoot(routes);
