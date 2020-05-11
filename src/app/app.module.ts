import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses/courses.component';
import { HttpService, GameService } from '@/_services';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavigationComponent } from './navigation/navigation.component';
import { CourseComponent } from './course/course.component';
import { ChartsModule } from 'ng2-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddCourseComponent } from './add-course/add-course.component';
import { RoundsComponent } from './rounds/rounds.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';
import { RoundComponent } from './round/round.component';
import { appRoutingModule } from './app.routing';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AlertComponent } from './alert/alert.component';
import { ErrorInterceptor, JwtInterceptor} from '@/_helpers';
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
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    NavigationComponent,
    CourseComponent,
    AddCourseComponent,
    RoundsComponent,
    AddScorecardComponent,
    RoundComponent,
    HomeComponent,
    LoginComponent,
    AlertComponent,
    RegistrationComponent,
    UpdatePlayerComponent,
    GamesComponent,
    HoleStakeSetupComponent,
    HoleStakeGameComponent,
    HoleStakeRulesComponent,
    ChangeLogComponent,
    BbbGameRulesComponent,
    BbbGameSetupComponent,
    BbbGameComponent,
    LastGamesComponent,
    LastGamesDetailsComponent,
    ConfirmationDialogComponent,
  ],
  imports: [
    BrowserModule,
    appRoutingModule,
    HttpClientModule,
    ChartsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
  ],
  providers: [HttpService,
              GameService,
              { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmationDialogComponent]
})
export class AppModule { }
