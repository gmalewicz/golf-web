import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses/courses/courses.component';
import { HttpService } from '@/_services';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NavigationComponent } from './navigation/navigation.component';
import { NgChartsModule } from 'ng2-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddCourseComponent } from './add-course/add-course.component';
import { AddScorecardComponent } from './add-scorecard/add-scorecard.component';
import { routing } from './app.routing';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AlertComponent } from './alert/alert.component';
import { ErrorInterceptor, JwtInterceptor} from '@/_helpers';
import { RegistrationComponent } from './registration/registration.component';
import { UpdatePlayerComponent } from './update-player/update-player.component';
import { ChangeLogComponent } from './change-log/change-log.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { DropdownModule} from 'primeng/dropdown';
import { RecaptchaModule, RecaptchaFormsModule} from 'ng-recaptcha';
import { CourseComponent } from './course/course.component';
import { ListCoursesComponent } from './courses/list-courses/list-courses.component';
import { RoundComponent } from './round/round/round.component';
import { RoundViewWHSComponent } from './round/round-view-whs/round-view-whs.component';
import { RoundViewMPComponent } from './round/round-view-mp/round-view-mp.component';
import { RoundViewComponent } from './round/round-view/round-view.component';
import { RoundSummaryComponent } from './round/round-summary/round-summary.component';
import { RoundsComponent } from './rounds/rounds/rounds.component';
import { ListRoundsComponent } from './rounds/list-rounds/list-rounds.component';
import { SessionRecoveryInterceptor } from './_helpers/session.interceptor';
import { AdminComponent } from './admin/admin.component';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UpdDialogComponent } from './admin/players/upd-dialog/upd-dialog.component';
import { FinishSocialDialogComponent } from './login/finish-social-dialog/finish-social-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { RoundsNavigationService } from './rounds/roundsNavigation.service';
import { PlayerDataInterceptor } from './_helpers/playerData.interceptor';
import { SearchPlayerDialogComponent } from './dialogs/search-player-dialog/search-player-dialog.component';


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
    ChangeLogComponent,
    ConfirmationDialogComponent,
    RoundViewWHSComponent,
    RoundViewMPComponent,
    RoundViewComponent,
    RoundSummaryComponent,
    ListCoursesComponent,
    ListRoundsComponent,
    AdminComponent,
    UpdDialogComponent,
    FinishSocialDialogComponent,
    SearchPlayerDialogComponent
  ],
  imports: [
    BrowserModule,
    routing,
    HttpClientModule,
    NgChartsModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatDialogModule,
    DropdownModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    HttpClientXsrfModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule
  ],
  providers: [HttpService,
              { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: SessionRecoveryInterceptor, multi: true },
              { provide: HTTP_INTERCEPTORS, useClass: PlayerDataInterceptor, multi: true },
              RoundsNavigationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
